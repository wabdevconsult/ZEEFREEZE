const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logAuthAttempt } = require('../utils/authLogger');
const { z } = require('zod');

// Configuration des tokens
const tokenConfig = {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // false en développement
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.COOKIE_DOMAIN || '15.236.206.129',
    path: '/'
  }
};

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, iss: 'zefreeze-api' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    // Validation
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (user?.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({ 
        success: false,
        error: 'Compte temporairement verrouillé',
        remainingTime 
      });
    }

    if (!user || !(await user.matchPassword(password))) {
      if (user) {
        await User.findByIdAndUpdate(user._id, { 
          $inc: { loginAttempts: 1 },
          ...(user.loginAttempts + 1 >= 5 ? { 
            lockUntil: Date.now() + 30 * 60 * 1000
          } : {})
        });
      }
      logAuthAttempt(email, false, req.ip);
      return res.status(401).json({ 
        success: false,
        error: 'Identifiants invalides'
      });
    }

    // Réinitialisation des tentatives après succès
   if (user.loginAttempts > 0 || user.lockUntil) {
      await User.findByIdAndUpdate(user._id, {
        loginAttempts: 0,
        lockUntil: null,
        lastLoginAt: new Date()
      });
    }

   const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).status(200).json({
      success: true,
      user: userResponse
    });

    logAuthAttempt(email, true, req.ip);
  } catch (err) {
    console.error(`Login Error: ${err.message}`);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur'
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('auth_token', tokenConfig.cookieOptions)
     .status(200)
     .json({ 
       success: true,
       message: 'Déconnexion réussie' 
     });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -loginAttempts -lockUntil');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }
    res.status(200).json({ 
      success: true,
      user 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ 
        success: false,
        error: 'Email déjà utilisé' 
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'client',
      loginAttempts: 0,
      lockUntil: null
    });

    const token = generateToken(newUser);
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    res.cookie('auth_token', token, tokenConfig.cookieOptions)
       .status(201)
       .json({ 
         success: true,
         user: userResponse 
       });

  } catch (err) {
    console.error(`Register Error: ${err.message}`);
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de l'inscription",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};