const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

module.exports = new LinkedInStrategy(
  {
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: '/api/auth/linkedin/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthCallback('linkedin', profile, accessToken, refreshToken);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);
