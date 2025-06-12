const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  countUsers,
  getRecentInterventions
} = require('../controllers/userController');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes pour les utilisateurs
router.get('/', roleMiddleware(['admin']), getAllUsers);
router.get('/count', roleMiddleware(['admin']), countUsers);
router.get('/:id', getUserById);
router.post('/', roleMiddleware(['admin']), createUser);
router.put('/:id', updateUser);
router.delete('/:id', roleMiddleware(['admin']), deleteUser);
router.patch('/:id/role', roleMiddleware(['admin']), updateUserRole);
router.get('/interventions/recent', roleMiddleware(['admin']), getRecentInterventions);

module.exports = router;