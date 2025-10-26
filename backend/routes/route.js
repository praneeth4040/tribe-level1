const express = require('express');
const passport = require('passport');
const authController = require('../components/auth');

const router = express.Router();

// Google OAuth routes
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/result?error=google_auth_failed' }),
  authController.googleCallback
);

// Protected routes
router.get('/auth/me', authController.getCurrentUser);
router.post('/auth/logout', authController.logout);

module.exports = router;