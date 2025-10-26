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
      userProfileURL: 'https://api.github.com/user',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub doesn't provide email in profile by default
        // We need to fetch it separately using the access token
        let email = profile.email;
        
        if (!email && accessToken) {
          try {
            const response = await fetch('https://api.github.com/user/emails', {
              headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            const emails = await response.json();
            if (Array.isArray(emails) && emails.length > 0) {
              // Get primary email or first verified email
              const primaryEmail = emails.find(e => e.primary) || emails.find(e => e.verified) || emails[0];
              email = primaryEmail.email;
            }
          } catch (emailError) {
            console.warn('Could not fetch GitHub email:', emailError.message);
          }
        }
        
        // If we have email, add it to profile for handler
        if (email) {
          profile.email = email;
        }
        
        const user = await handleOAuthCallback('github', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );
};
