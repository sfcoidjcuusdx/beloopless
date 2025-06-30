require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Test email from Node.js',
  text: 'Hello! This is a test email.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('Test email error:', error);
  }
  console.log('Test email sent:', info.response);
});
