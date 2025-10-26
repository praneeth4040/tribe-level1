/**
 * GUIDE: How to Add New OAuth Providers
 * 
 * Follow these steps to add any new OAuth provider:
 */

/**
 * STEP 1: Create Strategy File
 * Create a new file: config/strategies/{providerName}Strategy.js
 * 
 * Example for Facebook:
 */

// config/strategies/facebookStrategy.js
// const FacebookStrategy = require('passport-facebook').Strategy;
// const { handleOAuthCallback } = require('../utils/oauthHandler');

// module.exports = new FacebookStrategy(
//   {
//     clientID: process.env.FACEBOOK_CLIENT_ID,
//     clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//     callbackURL: '/api/auth/facebook/callback',
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       const user = await handleOAuthCallback('facebook', profile, accessToken, refreshToken);
//       return done(null, user);
//     } catch (error) {
//       return done(error, null);
//     }
//   }
// );

/**
 * STEP 2: Register Strategy in passport.js
 * Add to config/passport.js:
 */

// const facebookStrategy = require('./strategies/facebookStrategy');
// passport.use('facebook', facebookStrategy);

/**
 * STEP 3: Add Routes in routes/route.js
 */

// // Facebook OAuth routes
// router.get(
//   '/auth/facebook',
//   passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
// );

// router.get(
//   '/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/result?error=facebook_auth_failed' }),
//   authController.oauthCallback('facebook')
// );

/**
 * STEP 4: Add Environment Variables to .env
 */

// FACEBOOK_CLIENT_ID=your_facebook_client_id
// FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

/**
 * STEP 5: Install the required npm package
 */

// npm install passport-facebook

/**
 * PROVIDER-SPECIFIC SETUP GUIDES:
 */

/**
 * FACEBOOK:
 * - Package: passport-facebook
 * - Setup: https://developers.facebook.com/docs/facebook-login/web
 * - Scopes: 'public_profile', 'email'
 * - Profile fields: displayName, photos, email
 */

/**
 * GITHUB:
 * - Package: passport-github2
 * - Setup: https://github.com/settings/developers
 * - Scopes: 'user:email'
 * - Profile fields: displayName, photos, email, login
 */

/**
 * LINKEDIN:
 * - Package: passport-linkedin-oauth2
 * - Setup: https://www.linkedin.com/developers/apps
 * - Scopes: 'r_basicprofile', 'r_emailaddress'
 * - Profile fields: displayName, photos, email
 */

/**
 * TWITTER (v2):
 * - Package: passport-twitter-oauth2
 * - Setup: https://developer.twitter.com/en/portal/dashboard
 * - Scopes: 'tweet.read', 'users.read', 'follows.read'
 * - Profile fields: displayName, photos
 */

/**
 * INSTAGRAM:
 * - Package: passport-instagram
 * - Setup: https://developers.facebook.com/docs/instagram/get-started
 * - Scopes: 'user_profile'
 * - Profile fields: displayName, photos, username
 */

/**
 * REDDIT:
 * - Package: passport-reddit
 * - Setup: https://www.reddit.com/prefs/apps
 * - Scopes: 'identity'
 * - Profile fields: displayName, photos, name
 */

module.exports = {};
