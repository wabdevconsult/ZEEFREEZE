// backendZ/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  type: {
    type: String,
    required: true,
    enum: ['NEW_INTERVENTION', 'STATUS_CHANGED', 'NEW_MESSAGE', 'SYSTEM']
  },
  data: {
    type: Object,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);