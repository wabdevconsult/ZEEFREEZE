const QuoteRequest = require('../models/QuoteRequest');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAllQuoteRequests = async (req, res, next) => {
  try {
    const features = new ApiFeatures(
      QuoteRequest.find().populate('createdBy', 'name email'),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const quoteRequests = await features.query;

    res.status(200).json({
      status: 'success',
      results: quoteRequests.length,
      data: {
        quoteRequests
      }
    });
  } catch (err) {
    next(err);
  }
};

// ... autres méthodes du contrôleur

// Créer une demande
exports.createQuoteRequest = async (req, res) => {
  try {
    req.body.createdBy = req.user.id; // Ajoute l'utilisateur connecté
    const newRequest = await QuoteRequest.create(req.body);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer une demande spécifique
exports.getQuoteRequestById = async (req, res) => {
  try {
    const request = await QuoteRequest.findById(req.params.id).populate('createdBy', 'name email');
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une demande
exports.updateQuoteRequest = async (req, res) => {
  try {
    const updatedRequest = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRequest) return res.status(404).json({ message: 'Demande non trouvée' });
    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une demande
exports.deleteQuoteRequest = async (req, res) => {
  try {
    const deletedRequest = await QuoteRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) return res.status(404).json({ message: 'Demande non trouvée' });
    res.json({ message: 'Demande supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};