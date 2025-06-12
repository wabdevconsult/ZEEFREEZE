const mongoose = require('mongoose');

module.exports = {
  getNotification: () => mongoose.models.Notification || require('../models/Notification'),
  getUser: () => mongoose.models.User || require('../models/User')
};