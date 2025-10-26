const RedditStrategy = require('passport-reddit').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create Reddit OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured Reddit OAuth strategy
 * 
 * @example
 * const redditStrategy = require('multi-oauth-strategies/strategies/redditStrategy');
 * const strategy = redditStrategy(User);
 * passport.use('reddit', strategy);
 */
module.exports = (userModel) => {
  return new RedditStrategy(
    {
      clientID: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      callbackURL: process.env.REDDIT_CALLBACK_URL || '/api/auth/reddit/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('reddit', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
