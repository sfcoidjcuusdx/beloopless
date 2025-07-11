const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.ADMIN_SECRET,
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
  if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
    req.session.admin = true;
    return res.redirect('/admin/dashboard');
  }
  res.send('Unauthorized');
});

// Protected dashboard
app.get('/admin/dashboard', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');
  res.send('<h1>Welcome, Admin!</h1><form method="POST" action="/admin/post"><input name="title" placeholder="Title"/><textarea name="content"></textarea><button type="submit">Post</button></form>');
});

// Post submission
app.post('/admin/post', (req, res) => {
  if (!req.session.admin) return res.status(403).send('Forbidden');
  const posts = JSON.parse(fs.readFileSync('./posts.json', 'utf8'));
  posts.unshift({ title: req.body.title, content: req.body.content, date: new Date().toISOString() });
  fs.writeFileSync('./posts.json', JSON.stringify(posts, null, 2));
  res.redirect('/admin/dashboard');
});

// Public blog API
app.get('/api/posts', (req, res) => {
  const posts = JSON.parse(fs.readFileSync('./posts.json', 'utf8'));
  res.json(posts);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
