const InstagramStrategy = require('passport-instagram').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

module.exports = new InstagramStrategy(
  {
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: '/api/auth/instagram/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthCallback('instagram', profile, accessToken, refreshToken);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);
