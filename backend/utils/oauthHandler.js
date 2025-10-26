const User = require('../models/User');

/**
 * Generic OAuth callback handler
 * @param {string} provider - OAuth provider name (google, facebook, etc.)
 * @param {object} profile - User profile from OAuth provider
 * @param {string} accessToken - Access token from provider
 * @param {string} refreshToken - Refresh token from provider (optional)
 */
async function handleOAuthCallback(provider, profile, accessToken, refreshToken = null) {
  try {
    // Check if user already exists with this provider ID
    let user = await User.findOne({
      [`oauthProviders.${provider}.id`]: profile.id,
    });

    if (user) {
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
    user = await User.findOne({ email: profile.email });

    if (user) {
      // Link this provider to existing account
      user.oauthProviders[provider] = {
        id: profile.id,
        accessToken: accessToken,
        ...(refreshToken && { refreshToken: refreshToken }),
      };

      if (!user.linkedProviders.includes(provider)) {
        user.linkedProviders.push(provider);
      }

      await user.save();
      return user;
    }

    // Create new user
    user = new User({
      email: profile.email,
      name: profile.displayName,
      profilePic: profile.photos?.[0]?.value || profile.picture || null,
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
    return user;
  } catch (error) {
    console.error(`OAuth callback error for ${provider}:`, error);
    throw error;
  }
}

module.exports = {
  handleOAuthCallback,
};
