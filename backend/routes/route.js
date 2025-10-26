const express = require('express');
const passport = require('passport');
const authController = require('../components/auth');

const router = express.Router();

// ============ Google OAuth Routes ============
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/result?error=google_auth_failed' }),
  authController.googleCallback
);

// ============ Facebook OAuth Routes ============
// router.get(
//   '/auth/facebook',
//   passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
// );

// router.get(
//   '/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/result?error=facebook_auth_failed' }),
//   authController.oauthCallback('facebook')
// );

// ============ GitHub OAuth Routes ============
// router.get(
//   '/auth/github',
//   passport.authenticate('github', { scope: ['user:email'] })
// );

// router.get(
//   '/auth/github/callback',
//   passport.authenticate('github', { failureRedirect: '/result?error=github_auth_failed' }),
//   authController.oauthCallback('github')
// );

// ============ LinkedIn OAuth Routes ============
// router.get(
//   '/auth/linkedin',
//   passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] })
// );

// router.get(
//   '/auth/linkedin/callback',
//   passport.authenticate('linkedin', { failureRedirect: '/result?error=linkedin_auth_failed' }),
//   authController.oauthCallback('linkedin')
// );

// ============ Twitter OAuth Routes ============
// router.get(
//   '/auth/twitter',
//   passport.authenticate('twitter')
// );

// router.get(
//   '/auth/twitter/callback',
//   passport.authenticate('twitter', { failureRedirect: '/result?error=twitter_auth_failed' }),
//   authController.oauthCallback('twitter')
// );

// ============ Instagram OAuth Routes ============
// router.get(
//   '/auth/instagram',
//   passport.authenticate('instagram', { scope: ['user_profile'] })
// );

// router.get(
//   '/auth/instagram/callback',
//   passport.authenticate('instagram', { failureRedirect: '/result?error=instagram_auth_failed' }),
//   authController.oauthCallback('instagram')
// );

// ============ Reddit OAuth Routes ============
// router.get(
//   '/auth/reddit',
//   passport.authenticate('reddit', { scope: ['identity'] })
// );

// router.get(
//   '/auth/reddit/callback',
//   passport.authenticate('reddit', { failureRedirect: '/result?error=reddit_auth_failed' }),
//   authController.oauthCallback('reddit')
// );

// Protected routes
router.get('/auth/me', authController.getCurrentUser);
router.post('/auth/logout', authController.logout);

module.exports = router;