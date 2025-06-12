const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getAllReports,
  countReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  addPhotos,
  signReport,
  generatePdf,
  getTemperatureLogs,
  addTemperatureLog
} = require('../controllers/reportsController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// General report routes
router.get('/', getAllReports);
router.get('/count', countReports);
router.get('/:id', getReportById);
router.post('/', upload.array('photos'), createReport);
router.put('/:id', upload.array('photos'), updateReport);
router.delete('/:id', roleMiddleware('admin'), deleteReport);

// Special routes
router.post('/:id/photos', upload.array('photos'), addPhotos);
router.post('/:id/sign', signReport);
router.get('/:id/pdf', generatePdf);

// Temperature logs
router.get('/temperature/logs', getTemperatureLogs);
router.post('/temperature/logs', roleMiddleware('technician'), addTemperatureLog);

module.exports = router;