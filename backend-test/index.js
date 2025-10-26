require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const multiOAuth = require('multi-oauth-strategies');

const User = require('./models/User');

const app = express();

// ===== DATABASE =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tribe-oauth-test')
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB error:', err));

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// ===== SETUP PASSPORT WITH PACKAGE =====
multiOAuth.setupPassport(passport, User, ['google', 'facebook', 'github']);

// ===== TEST HOME =====
app.get('/', (req, res) => {
  res.json({
    message: '🚀 OAuth Test Server Running',
    baseUrl: 'http://localhost:4000',
    endpoints: {
      'LOGIN': {
        'Google': 'http://localhost:4000/auth/google',
        'Facebook': 'http://localhost:4000/auth/facebook',
        'GitHub': 'http://localhost:4000/auth/github'
      },
      'CHECK': 'http://localhost:4000/auth/me',
      'LOGOUT': 'POST http://localhost:4000/auth/logout',
      'DB_USERS': 'http://localhost:4000/users'
    }
  });
});

// ===== GOOGLE =====
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  (req, res) => {
    res.redirect('/auth/me');
  }
);

// ===== FACEBOOK =====
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/error' }),
  (req, res) => {
    res.redirect('/auth/me');
  }
);

// ===== GITHUB =====
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/error' }),
  (req, res) => {
    res.redirect('/auth/me');
  }
);

// ===== GET CURRENT USER =====
app.get('/auth/me', (req, res) => {
  if (!req.user) {
    return res.json({
      message: '❌ Not logged in',
      login_urls: {
        google: 'http://localhost:4000/auth/google',
        facebook: 'http://localhost:4000/auth/facebook',
        github: 'http://localhost:4000/auth/github'
      }
    });
  }

  res.json({
    message: '✓ You are logged in!',
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      profilePic: req.user.profilePic,
      linkedProviders: req.user.linkedProviders,
      createdAt: req.user.createdAt
    }
  });
});

// ===== LOGOUT =====
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✓ Logged out successfully' });
  });
});

// ===== ERROR =====
app.get('/auth/error', (req, res) => {
  res.status(401).json({ error: '✗ Authentication failed' });
});

// ===== GET ALL USERS =====
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      total: users.length,
      users: users.map(u => ({
        _id: u._id,
        email: u.email,
        name: u.name,
        linkedProviders: u.linkedProviders,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 OAuth Test Backend Running        ║
╠════════════════════════════════════════╣
║ URL: http://localhost:${PORT}           ║
║ API: http://localhost:${PORT}/          ║
║ Me:  http://localhost:${PORT}/auth/me   ║
╚════════════════════════════════════════╝
  `);
});
