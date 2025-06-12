const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const c = require('../controllers/quoteController');

router.use(auth);

// Quote Requests
router.get('/requests', c.getNewRequests);
router.get('/requests/:id', c.getRequestById);
router.post('/requests', c.createRequest);
router.patch('/requests/:id', c.confirmRequest); // confirm or reject based on body.status

// Quotes
router.get('/', c.getQuotesByStatus); // ?status=confirmed|prepared|validated
router.get('/:id', c.getQuoteById);
router.post('/', c.createQuote);
router.patch('/:id', c.updateQuote);
router.post('/:id/prepare', c.prepareQuote);
router.post('/:id/send', c.sendQuote);

module.exports = router;
