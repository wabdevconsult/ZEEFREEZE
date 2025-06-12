const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const {
  createPaymentIntent,
  processPayment,
  getAllInvoices,
  getInvoiceById,
  downloadInvoicePdf
} = paymentController;

// ✅ Routes de paiement
router.post('/create-intent', createPaymentIntent);
router.post('/process', processPayment);
router.post('/simulate', paymentController.simulatePayment);
router.get('/check-payment', paymentController.checkPayment);

// ✅ Routes pour les factures (invoices)
router.get('/invoices', getAllInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/invoices/:id/download-pdf', downloadInvoicePdf);

module.exports = router;
