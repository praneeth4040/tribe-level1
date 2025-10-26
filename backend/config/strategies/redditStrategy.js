const RedditStrategy = require('passport-reddit').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

module.exports = new RedditStrategy(
  {
    clientID: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    callbackURL: '/api/auth/reddit/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthCallback('reddit', profile, accessToken, refreshToken);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);
