// routes/technicianRoutes.js
const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');

// Vérifiez que toutes ces méthodes existent dans votre contrôleur
router.post('/', technicianController.createTechnician);
router.get('/', technicianController.getAllTechnicians);
router.get('/:id', technicianController.getTechnicianById);
router.put('/:id', technicianController.updateTechnician);
router.delete('/:id', technicianController.deleteTechnician);

module.exports = router;