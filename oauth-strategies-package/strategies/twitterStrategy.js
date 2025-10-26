const TwitterStrategy = require('passport-twitter').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create Twitter OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured Twitter OAuth strategy
 * 
 * @example
 * const twitterStrategy = require('multi-oauth-strategies/strategies/twitterStrategy');
 * const strategy = twitterStrategy(User);
 * passport.use('twitter', strategy);
 */
module.exports = (userModel) => {
  return new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL || '/api/auth/twitter/callback',
      includeEmail: true,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        const user = await handleOAuthCallback('twitter', profile, token, tokenSecret, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
