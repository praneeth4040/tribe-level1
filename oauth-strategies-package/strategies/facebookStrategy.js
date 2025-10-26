const FacebookStrategy = require('passport-facebook').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create Facebook OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured Facebook OAuth strategy
 * 
 * @example
 * const facebookStrategy = require('multi-oauth-strategies/strategies/facebookStrategy');
 * const strategy = facebookStrategy(User);
 * passport.use('facebook', strategy);
 */
module.exports = (userModel) => {
  return new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('facebook', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
