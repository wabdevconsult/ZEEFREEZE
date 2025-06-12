const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Récupération du token soit depuis les cookies, soit depuis l'en-tête Authorization
  let token = req.cookies?.auth_token || req.signedCookies?.auth_token;
  
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentification requise' 
    });
  }

  try {
    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Erreur de vérification du token :', err);

    // Si le token est expiré, on nettoie le cookie
    if (err.name === 'TokenExpiredError') {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.COOKIE_DOMAIN || '15.236.206.129'
      });
    }

    return res.status(401).json({ 
      success: false,
      error: 'Token invalide ou expiré' 
    });
  }
};
