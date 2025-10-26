const InstagramStrategy = require('passport-instagram').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create Instagram OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured Instagram OAuth strategy
 * 
 * @example
 * const instagramStrategy = require('multi-oauth-strategies/strategies/instagramStrategy');
 * const strategy = instagramStrategy(User);
 * passport.use('instagram', strategy);
 */
module.exports = (userModel) => {
  return new InstagramStrategy(
    {
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: process.env.INSTAGRAM_CALLBACK_URL || '/api/auth/instagram/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('instagram', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
