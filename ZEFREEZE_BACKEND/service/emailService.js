// backendZ/service/emailService.js
const nodemailer = require('nodemailer');

// Configuration du transporteur email (à adapter selon vos besoins)
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou autre service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@votreapp.com',
      to,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

module.exports = {
  sendEmail
};