
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getAllNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  getUnreadCount
} = require('../controllers/notificationController');

router.use(authMiddleware);

// Routes sécurisées
router.get('/', getAllNotifications);
router.get('/unread', getUnreadNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);
router.post('/', createNotification);
router.get('/unread-count', getUnreadCount);

module.exports = router;