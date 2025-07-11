const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// ✅ Print loaded environment variables
console.log("✅ ENV CHECK:");
console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);
console.log("ADMIN_SECRET:", process.env.ADMIN_SECRET);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.ADMIN_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: true
}));

// Serve static files from views folder
app.use(express.static(path.join(__dirname, 'views')));

// Serve login page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Handle login
app.post('/admin', (req, res) => {
  const { username, password } = req.body;

  console.log("🟡 Login Attempt:", { username, password });
  console.log("🟢 Expected Username: admin");
  console.log("🟢 Expected Password:", process.env.ADMIN_PASSWORD);

  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = true;
    console.log("✅ Login successful");
    return res.redirect('/admin/dashboard');
  }

  console.log("❌ Login failed");
  res.status(401).send('Unauthorized: Incorrect username or password.');
});

// Admin dashboard
app.get('/admin/dashboard', (req, res) => {
  if (!req.session.admin) {
    console.log("🔒 Unauthorized dashboard access attempt");
    return res.redirect('/admin');
  }

  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

// Handle new post
app.post('/admin/post', (req, res) => {
  if (!req.session.admin) return res.status(403).send('Forbidden');

  const postsPath = path.join(__dirname, 'posts.json');
  let posts = [];

  try {
    posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  } catch (e) {
    console.error("⚠️ Failed to read posts.json. Initializing with empty array.");
  }

  posts.unshift({
    title: req.body.title,
    content: req.body.content,
    date: new Date().toISOString()
  });

  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  res.redirect('/admin/dashboard');
});

// Public API for blog posts
app.get('/api/posts', (req, res) => {
  const postsPath = path.join(__dirname, 'posts.json');

  try {
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    res.json(posts);
  } catch (error) {
    console.error("❌ Failed to load posts:", error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

