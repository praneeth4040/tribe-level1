const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
function generateToken(userId, expiresIn = '7d') {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
}

// Generate refresh token
function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Generic OAuth callback handler for all providers
 * @param {string} provider - OAuth provider name (google, facebook, etc.)
 */
function oauthCallback(provider) {
  return async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        const redirectUrl = `${process.env.FRONTEND_URL}/result?error=${provider}_auth_failed`;
        return res.redirect(redirectUrl);
      }

      // Generate tokens
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to DB
      user.refreshToken = refreshToken;
      await user.save();

      // Redirect to frontend result page with tokens as query params
      const redirectUrl = `${process.env.FRONTEND_URL}/result?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user._id}&provider=${provider}`;
      res.redirect(redirectUrl);
    } catch (err) {
      console.error(`${provider} callback error:`, err);
      res.redirect(`${process.env.FRONTEND_URL}/result?error=authentication_failed`);
    }
  };
}

// Google OAuth callback
const googleCallback = oauthCallback('google');

// Get current user (for persistent login)
async function getCurrentUser(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePic: user.profilePic,
        linkedProviders: user.linkedProviders,
      },
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Logout
function logout(req, res) {
  res.json({ message: 'Logout successful' });
}

module.exports = {
  googleCallback,
  oauthCallback,
  getCurrentUser,
  logout,
};

