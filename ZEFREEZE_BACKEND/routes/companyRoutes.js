const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  importCompanies,
  getCompanyStats
} = require('../controllers/companyController');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Routes principales
router.get('/', getAllCompanies);
router.get('/stats', getCompanyStats);
router.get('/:id', getCompanyById);
router.post('/', roleMiddleware(['admin', 'technician']), createCompany);
router.put('/:id', roleMiddleware(['admin', 'technician']), updateCompany);
router.delete('/:id', roleMiddleware('admin'), deleteCompany);

// Route d'import CSV
router.post('/import', roleMiddleware(['admin', 'technician']), importCompanies);

module.exports = router;