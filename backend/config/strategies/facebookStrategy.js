const FacebookStrategy = require('passport-facebook').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

module.exports = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthCallback('facebook', profile, accessToken, refreshToken);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);
