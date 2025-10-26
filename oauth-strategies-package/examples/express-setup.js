/**
 * Example: Complete setup with multi-oauth-strategies
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const oauthStrategies = require('multi-oauth-strategies');

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
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ============ Setup Passport Strategies ============

// Create strategies - each strategy accepts User model
const googleStrategy = require('multi-oauth-strategies/strategies/googleStrategy')(User);
const facebookStrategy = require('multi-oauth-strategies/strategies/facebookStrategy')(User);
const githubStrategy = require('multi-oauth-strategies/strategies/githubStrategy')(User);
const linkedinStrategy = require('multi-oauth-strategies/strategies/linkedinStrategy')(User);

// Register strategies
passport.use('google', googleStrategy);
passport.use('facebook', facebookStrategy);
passport.use('github', githubStrategy);
passport.use('linkedin', linkedinStrategy);

// Serialize/Deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ============ Routes ============

// Google OAuth
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    // User is authenticated
    res.redirect(`/dashboard?provider=google&userId=${req.user._id}`);
  }
);

// Facebook OAuth
app.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/error' }),
  (req, res) => {
    res.redirect(`/dashboard?provider=facebook&userId=${req.user._id}`);
  }
);

// GitHub OAuth
app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/error' }),
  (req, res) => {
    res.redirect(`/dashboard?provider=github&userId=${req.user._id}`);
  }
);

// LinkedIn OAuth
app.get(
  '/auth/linkedin',
  passport.authenticate('linkedin')
);

app.get(
  '/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/error' }),
  (req, res) => {
    res.redirect(`/dashboard?provider=linkedin&userId=${req.user._id}`);
  }
);

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
