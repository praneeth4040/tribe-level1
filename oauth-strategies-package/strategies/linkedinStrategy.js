const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create LinkedIn OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured LinkedIn OAuth strategy
 * 
 * @example
 * const linkedinStrategy = require('multi-oauth-strategies/strategies/linkedinStrategy');
 * const strategy = linkedinStrategy(User);
 * passport.use('linkedin', strategy);
 */
module.exports = (userModel) => {
  return new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('linkedin', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
