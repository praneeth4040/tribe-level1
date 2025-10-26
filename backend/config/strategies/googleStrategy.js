const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

module.exports = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthCallback('google', profile, accessToken, refreshToken);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);
