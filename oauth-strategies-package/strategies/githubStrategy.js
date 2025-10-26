const GitHubStrategy = require('passport-github2').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create GitHub OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured GitHub OAuth strategy
 * 
 * @example
 * const githubStrategy = require('multi-oauth-strategies/strategies/githubStrategy');
 * const strategy = githubStrategy(User);
 * passport.use('github', strategy);
 */
module.exports = (userModel) => {
  return new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('github', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
