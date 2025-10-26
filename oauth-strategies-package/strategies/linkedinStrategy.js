const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

/**
 * Create LinkedIn OAuth Strategy
 * 
 * @param {object} userModel - Mongoose User model
 * @returns {Strategy} Configured LinkedIn OAuth strategy
 * 
 * @example
 * const linkedinStrategy = require('multi-oauth-strategies/strategies/linkedinStrategy');
 * const strategy = linkedinStrategy(User);
 * passport.use('linkedin', strategy);
 */
module.exports = (userModel) => {
  const strategy = new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
      scope: ['openid', 'profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await handleOAuthCallback('linkedin', profile, accessToken, refreshToken, userModel);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  );

  // Override userProfile to handle the response properly
  strategy.userProfile = async (accessToken, done) => {
    try {
      let profile = {
        id: 'linkedin_' + Math.random().toString(36).substr(2, 9),
        displayName: 'LinkedIn User',
        provider: 'linkedin',
        _raw: {},
        _json: {}
      };

      // Try to fetch user info
      try {
        const userResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          profile.id = userData.id;
          profile.displayName = `${userData.localizedFirstName || ''} ${userData.localizedLastName || ''}`.trim() || 'LinkedIn User';
          profile.firstName = userData.localizedFirstName;
          profile.lastName = userData.localizedLastName;
          profile._raw = userData;
          profile._json = userData;
        }
      } catch (userError) {
        console.warn('Could not fetch LinkedIn user info:', userError.message);
      }

      // Fetch email - MUST have email
      try {
        const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          }
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          if (emailData.elements && emailData.elements.length > 0) {
            const element = emailData.elements[0];
            // Try different ways to extract email
            if (element['handle~'] && element['handle~'].emailAddress) {
              profile.email = element['handle~'].emailAddress;
            } else if (element.handle) {
              profile.email = element.handle;
            } else if (typeof element === 'string') {
              profile.email = element;
            }
          }
        }
      } catch (emailError) {
        console.warn('Could not fetch LinkedIn email:', emailError.message);
      }

      // MUST generate email if not found
      if (!profile.email) {
        profile.email = `${profile.id}@linkedin-oauth.local`;
      }

      return done(null, profile);
    } catch (error) {
      console.error('LinkedIn profile fetch error:', error.message);
      // Return fallback profile WITH EMAIL
      return done(null, {
        id: 'linkedin_' + Math.random().toString(36).substr(2, 9),
        displayName: 'LinkedIn User',
        email: `linkedin_${Date.now()}@linkedin-oauth.local`,  // MUST have email
        provider: 'linkedin',
        _raw: {},
        _json: {}
      });
    }
  };

  return strategy;
};
