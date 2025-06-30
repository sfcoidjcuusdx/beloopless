require('dotenv').config();   // Load .env variables at the very top
console.log('server.js file loaded');

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Simple test route to verify server is running
app.get('/test', (req, res) => {
  res.send('Test route works!');
});

// Configure your SMTP transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // from .env
    pass: process.env.EMAIL_PASS,    // from .env
  },
});

app.post('/join-waitlist', async (req, res) => {
  console.log('POST /join-waitlist called');
  console.log('Request body:', req.body);

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const mailOptions = {
    from: `"LoopLess Waitlist" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,   // you receive emails here
    subject: 'New Waitlist Signup',
    text: `New waitlist signup: ${email}`,
    html: `<p>New waitlist signup: <strong>${email}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Successfully joined waitlist!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
