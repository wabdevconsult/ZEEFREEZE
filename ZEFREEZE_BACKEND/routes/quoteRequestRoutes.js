const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const controller = require('../controllers/quoteRequestController');

// Routes protégées par authentification
router.use(auth);

// Routes de base
router.get('/', controller.getAllQuoteRequests);
router.post('/', controller.createQuoteRequest);
router.get('/:id', controller.getQuoteRequestById);
router.put('/:id', controller.updateQuoteRequest);
router.delete('/:id', controller.deleteQuoteRequest);

module.exports = router;