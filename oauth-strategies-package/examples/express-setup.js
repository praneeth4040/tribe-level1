/**
 * Example: Complete setup with multi-oauth-strategies
 * 
 * TWO APPROACHES:
 * 
 * 1. SIMPLIFIED (Recommended) - Passport initialized automatically
 * 2. MANUAL - Traditional approach with manual passport initialization
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multiOAuth = require('multi-oauth-strategies');

// Import User model
const User = require('./models/User');

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(express.json());

// ============ APPROACH 1: SIMPLIFIED (RECOMMENDED) ============
// 
// This approach automatically:
// - Sets up express-session
// - Initializes passport
// - Registers all strategies
// - Handles serialization/deserialization
//

multiOAuth.initializeOAuth(app, User, ['google', 'facebook', 'github', 'linkedin', 'twitter', 'instagram', 'reddit'], {
  secret: process.env.SESSION_SECRET || 'your-secret',
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
});

// console.log('✓ OAuth automatically initialized with Passport!');

// ============ APPROACH 2: MANUAL (Traditional) ============
// 
// Uncomment this section if you prefer manual setup
//
// const session = require('express-session');
// const passport = require('passport');
//
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false, httpOnly: true },
// }));
//
// app.use(passport.initialize());
// app.use(passport.session());
//
// multiOAuth.setupPassport(passport, User, ['google', 'facebook', 'github', 'linkedin']);


// ============ Routes ============

// Get current user
app.get('/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      profilePic: req.user.profilePic,
      linkedProviders: req.user.linkedProviders,
    },
  });
});

// ============ APPROACH 1: Using authenticateWithDefaults (Simplest) ============

// Google OAuth
app.get('/auth/google', multiOAuth.authenticateWithDefaults('google'));

app.get(
  '/auth/google/callback',
  multiOAuth.authenticateCallback('google', '/error'),
  (req, res) => {
    res.redirect(`/dashboard?provider=google&userId=${req.user._id}`);
  }
);

// Facebook OAuth
app.get('/auth/facebook', multiOAuth.authenticateWithDefaults('facebook'));

app.get(
  '/auth/facebook/callback',
  multiOAuth.authenticateCallback('facebook', '/error'),
  (req, res) => {
    res.redirect(`/dashboard?provider=facebook&userId=${req.user._id}`);
  }
);

// GitHub OAuth
app.get('/auth/github', multiOAuth.authenticateWithDefaults('github'));

app.get(
  '/auth/github/callback',
  multiOAuth.authenticateCallback('github', '/error'),
  (req, res) => {
    res.redirect(`/dashboard?provider=github&userId=${req.user._id}`);
  }
);

// LinkedIn OAuth
app.get('/auth/linkedin', multiOAuth.authenticateWithDefaults('linkedin'));

app.get(
  '/auth/linkedin/callback',
  multiOAuth.authenticateCallback('linkedin', '/error'),
  (req, res) => {
    res.redirect(`/dashboard?provider=linkedin&userId=${req.user._id}`);
  }
);

// Twitter OAuth
app.get('/auth/twitter', multiOAuth.authenticateWithDefaults('twitter'));

app.get(
  '/auth/twitter/callback',
  multiOAuth.authenticateCallback('twitter', '/error'),
  (req, res) => {
    res.redirect(`/dashboard?provider=twitter&userId=${req.user._id}`);
  }
);

// Instagram OAuth
app.get('/auth/instagram', multiOAuth.authenticateWithDefaults('instagram'));

app.get(
  '/auth/instagram/callback',
  multiOAuth.authenticateCallback('instagram', '/error'),
  (req, res) => {
    res.redirect(`/dashboard?provider=instagram&userId=${req.user._id}`);
  }
);

// Reddit OAuth
app.get('/auth/reddit', multiOAuth.authenticateWithDefaults('reddit'));

app.get(
  '/auth/reddit/callback',
  multiOAuth.authenticateCallback('reddit', '/error'),
  (req, res) => {
    res.redirect(`/dashboard?provider=reddit&userId=${req.user._id}`);
  }
);

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Logged out successfully' });
  });
});

// Error handling
app.get('/error', (req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// ============ APPROACH 2: Using authenticate with custom options ============
// Uncomment if you want to customize authentication options
//
// app.get('/auth/google', multiOAuth.authenticate('google', { scope: ['profile', 'email'] }));
// app.get('/auth/facebook', multiOAuth.authenticate('facebook', { scope: ['public_profile', 'email'] }));
// app.get('/auth/github', multiOAuth.authenticate('github', { scope: ['user:email'] }));
//
