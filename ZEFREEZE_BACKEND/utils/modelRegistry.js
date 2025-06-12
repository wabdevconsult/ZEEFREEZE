// backendZ/utils/modelRegistry.js
const mongoose = require('mongoose');

module.exports = {
  Notification: mongoose.models.Notification || require('../models/Notification'),
  User: mongoose.models.User || require('../models/User'),
  Intervention: mongoose.models.Intervention || require('../models/Intervention')
};