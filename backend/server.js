const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ✅ Print loaded environment variables
console.log("✅ ENV CHECK:");
console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);
console.log("ADMIN_SECRET:", process.env.ADMIN_SECRET);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.ADMIN_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: true
}));

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

  res.send(`
    <h1>Admin Dashboard</h1>
    <form method="POST" action="/admin/post">
      <input name="title" placeholder="Title" required /><br><br>
      <textarea name="content" rows="6" cols="60" placeholder="Write your post here..." required></textarea><br><br>
      <button type="submit">Publish</button>
    </form>
  `);
});

// Handle new post
app.post('/admin/post', (req, res) => {
  if (!req.session.admin) return res.status(403).send('Forbidden');

  const postsPath = path.join(__dirname, 'posts.json');
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
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
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  res.json(posts);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

