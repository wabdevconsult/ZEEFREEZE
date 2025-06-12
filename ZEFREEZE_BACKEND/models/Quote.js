const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuoteRequest' },
  items: [Object],
  total: Number,
  status: { type: String, enum: ['confirmed', 'prepared', 'validated'], default: 'confirmed' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);
