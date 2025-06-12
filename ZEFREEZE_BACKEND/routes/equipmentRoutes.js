const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/equipmentController');

// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  }
});

// Middleware de validation basique
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid ID format' 
    });
  }
  next();
};

// Vérification que le contrôleur a bien les méthodes nécessaires
const checkControllerMethods = () => {
  const requiredMethods = [
    'getAllEquipment',
    'getEquipmentById',
    'createEquipment',
    'updateEquipment',
    'deleteEquipment',
    'updateEquipmentStatus',
    'addMaintenanceRecord',
    'getMaintenanceSchedule'
  ];

  requiredMethods.forEach(method => {
    if (!controller[method] || typeof controller[method] !== 'function') {
      console.error(`❌ Missing method in controller: ${method}`);
      process.exit(1);
    }
  });
};

// Vérification au démarrage
checkControllerMethods();

// Routes principales
router.get('/', limiter, controller.getAllEquipment);
router.get('/:id', validateId, controller.getEquipmentById);

// Routes protégées
router.post('/', 
  authMiddleware,
  roleMiddleware(['admin', 'manager']),
  limiter,
  controller.createEquipment
);

router.put('/:id',
  authMiddleware,
  roleMiddleware(['admin', 'manager']),
  validateId,
  limiter,
  controller.updateEquipment
);

router.delete('/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  validateId,
  limiter,
  controller.deleteEquipment
);

// Routes de maintenance
router.patch('/:id/status',
  authMiddleware,
  roleMiddleware(['admin', 'manager', 'technician']),
  validateId,
  controller.updateEquipmentStatus
);

router.post('/:id/maintenance',
  authMiddleware,
  roleMiddleware(['admin', 'manager', 'technician']),
  validateId,
  controller.addMaintenanceRecord
);

router.get('/maintenance/upcoming',
  authMiddleware,
  controller.getMaintenanceSchedule
);

module.exports = router;