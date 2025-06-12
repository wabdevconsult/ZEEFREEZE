// controllers/paymentController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

// Exemple : simulation d'une base de données locale
const fakeInvoices = [
  { id: 'inv1', amount: 100, date: '2024-01-01' },
  { id: 'inv2', amount: 150, date: '2024-02-01' },
];

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'eur' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    // Implémentation fictive
    res.status(200).json({ success: true, message: 'Paiement traité.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.simulatePayment = (req, res) => {
  return res.json({ message: 'Simulation paiement OK' });
};

exports.checkPayment = (req, res) => {
  return res.json({ status: 'Paiement vérifié' });
};

exports.getAllInvoices = (req, res) => {
  return res.json(fakeInvoices);
};

exports.getInvoiceById = (req, res) => {
  const invoice = fakeInvoices.find(inv => inv.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Facture introuvable' });
  res.json(invoice);
};

exports.downloadInvoicePdf = (req, res) => {
  const invoiceId = req.params.id;
  const filePath = path.join(__dirname, '..', 'invoices', `${invoiceId}.pdf`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier PDF introuvable' });
  }

  res.download(filePath);
};
