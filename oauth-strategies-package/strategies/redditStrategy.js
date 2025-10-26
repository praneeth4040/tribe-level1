const { Strategy: OAuth2Strategy } = require('passport-oauth2');
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
  const strategy = new OAuth2Strategy(
    {
      authorizationURL: 'https://www.reddit.com/api/v1/authorize',
      tokenURL: 'https://www.reddit.com/api/v1/access_token',
      clientID: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      callbackURL: process.env.REDDIT_CALLBACK_URL || '/api/auth/reddit/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        done(null, profile);
      } catch (error) {
        done(error, null);
      }
    }
  );

  // Override userProfile method to fetch from Reddit API properly
  strategy.userProfile = async (accessToken, done) => {
    try {
      const response = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'TribeApp/1.0.0 (by praneeth4040)',
        }
      });

      if (!response.ok) {
        return done(new Error(`Reddit API error: ${response.status}`));
      }

      const profile = await response.json();

      if (profile && profile.name) {
        return done(null, {
          id: profile.id,
          username: profile.name,
          displayName: profile.name,
          email: `${profile.name}@reddit-oauth.local`, // Reddit doesn't provide email
          provider: 'reddit',
          _raw: profile,
          _json: profile
        });
      }

      return done(new Error('No profile data from Reddit'));
    } catch (error) {
      return done(error);
    }
  };

  // Override the strategy's verify callback to use our handler
  strategy._verify = async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthCallback('reddit', profile, accessToken, refreshToken, userModel);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  };

  return strategy;
};
