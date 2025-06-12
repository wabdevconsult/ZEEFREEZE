const Message = require('../models/Message');
const generateToken = require('../utils/generateToken');
// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

    const message = new Message({
      senderId,
      recipientId,
      content,
    });

    await message.save();

    res.status(201).json({ message: 'Message envoyé', data: message });
  } catch (error) {
    console.error('Erreur envoi message:', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Nombre de messages non lus pour l'utilisateur connecté
exports.getUnreadCount = async (req, res) => {
  const recipientId = req.query.recipientId;
  if (!recipientId) return res.status(400).json({ message: "Missing recipientId" });

  const count = await Message.countDocuments({ recipient: recipientId, read: false });
  return res.status(200).json({ count });
};
