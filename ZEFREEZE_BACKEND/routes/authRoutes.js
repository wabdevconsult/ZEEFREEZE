const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/login', authController.login);  // Changé de '/auth/login' à '/login'
router.post('/register', authController.register); // Changé de '/auth/register' à '/register'

// Routes protégées
router.get('/me', authMiddleware, authController.getMe); // Changé de '/auth/me' à '/me'
router.post('/logout', authMiddleware, authController.logout); // Changé de '/auth/logout' à '/logout'

module.exports = router;