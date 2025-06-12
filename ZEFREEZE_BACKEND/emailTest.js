require('dotenv').config();
const { sendEmail } = require('./service/emailService');

sendEmail({
  to: 'destinataire@example.com',
  subject: 'Test Email',
  text: 'Ceci est un test depuis votre application'
}).catch(console.error);