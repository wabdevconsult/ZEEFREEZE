// controllers/userController.js
const User = require('../models/User');
const Intervention = require('../models/Intervention');
// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    res.status(200).json({
      success: true,
      data: users
    });
    console.log(users);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    // Validation du rôle
    if (req.body.role && !['admin', 'technician', 'client'].includes(req.body.role)) {
      return res.status(400).json({
        success: false,
        error: 'Rôle invalide'
      });
    }

    const user = new User(req.body);
    await user.save();

    // Exclure le mot de passe dans la réponse
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    // Validation du rôle si présent dans la requête
    if (req.body.role && !['admin', 'technician', 'client'].includes(req.body.role)) {
      return res.status(400).json({
        success: false,
        error: 'Rôle invalide'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Mettre à jour le rôle d'un utilisateur
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'technician', 'client'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Rôle invalide'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Utilisateur supprimé avec succès'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};
//
exports.countUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error counting users:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du comptage des utilisateurs'
    });
  }
};

//
exports.getRecentInterventions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const interventions = await Intervention.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('company technician');
    
    res.status(200).json({
      success: true,
      data: interventions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des interventions'
    });
  }
};
