const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create Google OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured Google OAuth strategy
 * 
 * @example
 * const googleStrategy = require('multi-oauth-strategies/strategies/googleStrategy');
 * const strategy = googleStrategy(User);
 * passport.use('google', strategy);
 */
module.exports = (userModel) => {
  return new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      userProfileURL: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('google', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
