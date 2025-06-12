const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET, // doit être défini dans le .env
    { expiresIn: '30d' }
  );
};