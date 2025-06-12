
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
//  GET /api/notifications
const getAllNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Erreur getAllNotifications :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des notifications' });
  }
};

//  GET /api/notifications/unread
const getUnreadNotifications = async (req, res) => {
  try {
     if (!req.user || !req.user._id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    const userId = req.user.id;
    const unread = await Notification.find({ userId, read: false }).sort({ createdAt: -1 });
    res.status(200).json(unread);
  } catch (error) {
    console.error('Erreur getUnreadNotifications :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des notifications non lues' });
  }
};

//  PATCH /api/notifications/:id/read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Erreur markNotificationAsRead :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
};

// PATCH /api/notifications/read-all
const markAllNotificationsAsRead = async (req, res) => {
  try {
     if (!req.user || !req.user._id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    const userId = req.user.id;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur markAllNotificationsAsRead :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour groupée' });
  }
};

// POST /api/notifications
const createNotification = async (req, res) => {
  try {
     if (!req.user || !req.user._id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    const { userId, title, message, type } = req.body;

    const notification = new Notification({
      userId,
      title,
      message,
      type,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Erreur createNotification :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la notification' });
  }
};
const getUnreadCount = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, read: false });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Erreur getUnreadCount :', error);
    res.status(500).json({ message: 'Erreur serveur lors du comptage des notifications non lues' });
  }
};

module.exports = {
  getAllNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  getUnreadCount // Ajouté ici
};