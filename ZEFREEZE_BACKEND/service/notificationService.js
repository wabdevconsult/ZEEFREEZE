// backendZ/service/notificationService.js
const { getNotification, getUser } = require('../utils/modelRegistry');
const { Notification, User } = require('../utils/modelRegistry');
const { sendEmail } = require('./emailService');

async function sendNotification({ type, recipient, recipientRoles, data }) {
  try {
    let recipients = [];

    if (recipientRoles) {
      recipients = await User.find({ role: { $in: recipientRoles } });
    } 
    else if (recipient) {
      const user = await User.findById(recipient);
      if (user) recipients.push(user);
    }

    const notifications = await Notification.insertMany(
      recipients.map(user => ({
        user: user._id,
        type,
        data,
        read: false
      }))
    );

    if (type === 'STATUS_CHANGED' || type === 'NEW_INTERVENTION') {
      await Promise.all(
        recipients.map(user => 
          sendEmail({
            to: user.email,
            subject: `Notification: ${type}`,
            text: data.message
          })
        )
      );
    }

    return notifications;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    throw error;
  }
}

// Export unique (supprimez l'export précédent)
module.exports = {
  sendNotification
};