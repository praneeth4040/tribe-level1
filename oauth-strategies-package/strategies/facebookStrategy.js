const FacebookStrategy = require('passport-facebook').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create Facebook OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured Facebook OAuth strategy
 * 
 * @example
 * const facebookStrategy = require('multi-oauth-strategies/strategies/facebookStrategy');
 * const strategy = facebookStrategy(User);
 * passport.use('facebook', strategy);
 */
module.exports = (userModel) => {
  const strategy = new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('[Facebook] Profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
          hasPhotos: !!profile.photos?.length
        });

        const user = await handleOAuthCallback('facebook', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        console.error('[Facebook] Auth error:', error.message);
        return done(error, null);
      }
    }
  );

  // Ensure we get email from Facebook API
  strategy.userProfile = function(accessToken, done) {
    console.log('[Facebook] Fetching user profile...');
    
    // Use correct Facebook Graph API fields (displayName doesn't exist)
    this._oauth2.get(
      'https://graph.facebook.com/me?fields=id,name,first_name,last_name,email,picture.width(200).height(200)',
      accessToken,
      function(err, body, res) {
        if (err) {
          console.error('[Facebook] Profile fetch error:', err.message);
          console.error('[Facebook] Error details:', err);
          
          // Handle specific Facebook errors
          if (err.message && err.message.includes('used')) {
            return done(new Error('Authorization code has been used. Please try logging in again.'));
          }
          
          return done(err);
        }

        try {
          const json = JSON.parse(body);
          
          console.log('[Facebook] Raw data received:', {
            id: json.id,
            name: json.name,
            first_name: json.first_name,
            last_name: json.last_name,
            email: json.email,
            hasPicture: !!json.picture
          });
          
          // Build profile object with correct fields
          const profile = {
            provider: 'facebook',
            id: json.id,
            displayName: json.name || `${json.first_name || ''} ${json.last_name || ''}`.trim() || 'Facebook User',
            name: {
              familyName: json.last_name || '',
              givenName: json.first_name || ''
            },
            emails: json.email ? [{ value: json.email }] : [],
            photos: json.picture && json.picture.data && json.picture.data.url ? [{ value: json.picture.data.url }] : [],
            _raw: body,
            _json: json
          };

          console.log('[Facebook] Profile parsed successfully:', {
            id: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0]?.value || 'NO EMAIL'
          });

          done(null, profile);
        } catch (e) {
          console.error('[Facebook] JSON parse error:', e.message);
          done(e);
        }
      }
    );
  };

  return strategy;
};
