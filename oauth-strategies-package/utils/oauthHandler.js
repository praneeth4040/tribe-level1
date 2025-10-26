/**
 * Generic OAuth callback handler
 * Handles user creation, updates, and account linking
 * 
 * @param {string} provider - OAuth provider name (google, facebook, etc.)
 * @param {object} profile - User profile from OAuth provider
 * @param {string} accessToken - Access token from provider
 * @param {string} refreshToken - Refresh token from provider (optional)
 * @param {object} userModel - Mongoose User model
 * @returns {Promise} User object
 * 
 * @example
 * const { handleOAuthCallback } = require('multi-oauth-strategies');
 * 
 * const user = await handleOAuthCallback('google', profile, accessToken, refreshToken, User);
 */
async function handleOAuthCallback(provider, profile, accessToken, refreshToken = null, userModel) {
  if (!userModel) {
    throw new Error('User model is required. Pass it as the 5th argument to handleOAuthCallback');
  }

  try {
    // Extract email from profile - handle different provider formats
    let email = profile.email || profile.emails?.[0]?.value || null;
    
    if (!email) {
      throw new Error(`No email found in ${provider} profile. Make sure 'email' scope is included in OAuth request.`);
    }

    console.log(`[OAuth] Processing ${provider} login for email: ${email}`);

    // Check if user already exists with this provider ID
    let user = await userModel.findOne({
      [`oauthProviders.${provider}.id`]: profile.id,
    });

    if (user) {
      console.log(`[OAuth] Found existing user by provider ID for ${provider}`);
      // Update tokens and provider info
      user.oauthProviders[provider] = {
        id: profile.id,
        accessToken: accessToken,
        ...(refreshToken && { refreshToken: refreshToken }),
      };
      await user.save();
      return user;
    }

    // Check if user exists with this email
    user = await userModel.findOne({ email: email });

    if (user) {
      console.log(`[OAuth] Found existing user by email. Linking ${provider} account.`);
      // Link this provider to existing account
      user.oauthProviders[provider] = {
        id: profile.id,
        accessToken: accessToken,
        ...(refreshToken && { refreshToken: refreshToken }),
      };

      if (!user.linkedProviders.includes(provider)) {
        user.linkedProviders.push(provider);
        console.log(`[OAuth] Added ${provider} to linkedProviders`);
      }

      await user.save();
      return user;
    }

    // Create new user
    console.log(`[OAuth] Creating new user for ${provider}`);
    user = new userModel({
      email: email,
      name: profile.displayName || profile.name || profile.username || 'User',
      profilePic: profile.photos?.[0]?.value || profile.picture || profile._json?.picture?.data?.url || null,
      oauthProviders: {
        [provider]: {
          id: profile.id,
          accessToken: accessToken,
          ...(refreshToken && { refreshToken: refreshToken }),
        },
      },
      linkedProviders: [provider],
    });

    await user.save();
    console.log(`[OAuth] User created successfully`);
    return user;
  } catch (error) {
    console.error(`OAuth callback error for ${provider}:`, error);
    throw error;
  }
}

module.exports = {
  handleOAuthCallback,
};
