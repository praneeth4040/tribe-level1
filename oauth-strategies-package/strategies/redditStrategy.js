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
  const clientID = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  
  const strategy = new OAuth2Strategy(
    {
      authorizationURL: 'https://www.reddit.com/api/v1/authorize',
      tokenURL: 'https://www.reddit.com/api/v1/access_token',
      clientID: clientID,
      clientSecret: clientSecret,
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

  // Reddit requires Basic Auth for token endpoint
  strategy._oauth2._useAuthorizationHeaderForGET = true;
  const originalGetOAuthAccessToken = strategy._oauth2.getOAuthAccessToken;
  strategy._oauth2.getOAuthAccessToken = function (code, params, callback) {
    params.grant_type = 'authorization_code';
    
    const authHeader = 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
    
    return this._request('POST', 'https://www.reddit.com/api/v1/access_token', 
      {
        'Authorization': authHeader,
        'User-Agent': 'TribeApp/1.0.0 (by praneeth4040)',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      require('querystring').stringify(params),
      null,
      function(error, data, response) {
        if (error) {
          callback(error);
        } else {
          let results;
          try {
            results = JSON.parse(data);
          } catch (e) {
            results = require('querystring').parse(data);
          }
          callback(null, results.access_token, results.refresh_token, results);
        }
      }
    );
  };

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
          email: `${profile.name}@reddit-oauth.local`,
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
