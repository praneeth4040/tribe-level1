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

      // Try multiple email endpoints
      let emailFound = false;

      // Approach 1: Try OpenID Connect /userinfo endpoint
      if (!emailFound) {
        try {
          const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            }
          });

          if (userinfoResponse.ok) {
            const userinfoData = await userinfoResponse.json();
            if (userinfoData.email) {
              profile.email = userinfoData.email;
              emailFound = true;
              console.log('[LinkedIn] Got email from userinfo endpoint');
            }
          }
        } catch (e) {
          console.warn('[LinkedIn] userinfo endpoint failed:', e.message);
        }
      }

      // Approach 2: Try v2 emailAddress endpoint
      if (!emailFound) {
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
                emailFound = true;
                console.log('[LinkedIn] Got email from handle~ field');
              } else if (element.handle) {
                profile.email = element.handle;
                emailFound = true;
                console.log('[LinkedIn] Got email from handle field');
              }
            }
          }
        } catch (emailError) {
          console.warn('[LinkedIn] emailAddress endpoint failed:', emailError.message);
        }
      }

      // Approach 3: Try old /v1/ endpoint as fallback
      if (!emailFound) {
        try {
          const oldEmailResponse = await fetch('https://api.linkedin.com/v1/people/~:(email-address)', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            }
          });

          if (oldEmailResponse.ok) {
            const oldEmailData = await oldEmailResponse.json();
            if (oldEmailData.emailAddress) {
              profile.email = oldEmailData.emailAddress;
              emailFound = true;
              console.log('[LinkedIn] Got email from v1 endpoint');
            }
          }
        } catch (e) {
          console.warn('[LinkedIn] v1 endpoint failed:', e.message);
        }
      }

      // Fallback: use ID-based email
      if (!profile.email) {
        profile.email = `${profile.id}@linkedin-oauth.local`;
        console.warn('[LinkedIn] Using fallback email:', profile.email);
      }

      return done(null, profile);
    } catch (error) {
      console.error('LinkedIn profile fetch error:', error.message);
      // Return fallback profile WITH EMAIL
      return done(null, {
        id: 'linkedin_' + Math.random().toString(36).substr(2, 9),
        displayName: 'LinkedIn User',
        email: `linkedin_${Date.now()}@linkedin-oauth.local`,
        provider: 'linkedin',
        _raw: {},
        _json: {}
      });
    }
  };

  return strategy;
};
