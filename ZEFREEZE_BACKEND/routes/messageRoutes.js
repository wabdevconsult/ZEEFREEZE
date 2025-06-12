// backendZ/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Message = require('../models/Message');

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const recipientId = req.query.recipientId;
    const userId = req.user?.id;

    console.log('[DEBUG user vs recipient]', { userId, recipientId });

    if (!userId || String(userId) !== String(recipientId)) {
      return res.status(403).json({ message: 'ID utilisateur non autorisé' });
    }

    const unreadCount = await Message.countDocuments({
      recipientId,
      read: false,
    });

    return res.json({ count: unreadCount });
  } catch (error) {
    console.error('❌ Erreur serveur unread-count:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
