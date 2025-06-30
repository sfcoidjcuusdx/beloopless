require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,  // send to yourself to verify
      subject: 'SMTP Test Email',
      text: 'This is a test email to verify SMTP configuration is working.',
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

sendTestEmail();
