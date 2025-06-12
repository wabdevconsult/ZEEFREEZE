const Quote = require('../models/Quote');
const QuoteRequest = require('../models/QuoteRequest');
const generateToken = require('../utils/generateToken');
// --- Quote Requests ---
exports.getNewRequests = async (req, res) => {
try {
  const quotes = await QuoteRequest.find({ status: 'pending' });
  res.json(quotes);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.getRequestById = async (req, res) => {
try {
  const quote = await QuoteRequest.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: 'Not found' });
  res.json(quote);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.createRequest = async (req, res) => {
try {
  const data = req.body;
  const created = await QuoteRequest.create({ ...data, createdBy: req.user.id });
  res.status(201).json(created);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.confirmRequest = async (req, res) => {
try {
  await QuoteRequest.findByIdAndUpdate(req.params.id, { status: 'confirmed' });
  res.status(204).end();
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.rejectRequest = async (req, res) => {
try {
  await QuoteRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  res.status(204).end();
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

// --- Quotes ---
exports.getQuotesByStatus = async (req, res) => {
try {
  const quotes = await Quote.find({ status: req.query.status });
  res.json(quotes);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.getQuoteById = async (req, res) => {
try {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: 'Not found' });
  res.json(quote);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.createQuote = async (req, res) => {
try {
  const created = await Quote.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(created);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.updateQuote = async (req, res) => {
try {
  const updated = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.prepareQuote = async (req, res) => {
try {
  await Quote.findByIdAndUpdate(req.params.id, { status: 'prepared' });
  res.status(204).end();
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};

exports.sendQuote = async (req, res) => {
try {
  await Quote.findByIdAndUpdate(req.params.id, { status: 'validated' });
  res.status(204).end();
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Internal Server Error' });
}
};
