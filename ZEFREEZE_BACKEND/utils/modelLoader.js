// backendZ/utils/modelLoader.js
const mongoose = require('mongoose');

module.exports = {
  Notification: mongoose.models.Notification || require('../models/Notification'),
  User: mongoose.models.User || require('../models/User')
  // Ajoutez d'autres modèles au besoin
};