const TwitterStrategy = require('passport-twitter').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

module.exports = new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: '/api/auth/twitter/callback',
    includeEmail: true,
  },
  async (token, tokenSecret, profile, done) => {
    try {
      // For Twitter, we use token instead of accessToken
      const user = await handleOAuthCallback('twitter', profile, token, tokenSecret);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);
