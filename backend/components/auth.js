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

// Google OAuth callback
async function googleCallback(req, res) {
  try {
    const user = req.user;

    if (!user) {
      const redirectUrl = `${process.env.FRONTEND_URL}/result?error=authentication_failed`;
      return res.redirect(redirectUrl);
    }

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    // Redirect to frontend result page with tokens as query params
    const redirectUrl = `${process.env.FRONTEND_URL}/result?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user._id}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/result?error=authentication_failed`);
  }
}

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
  getCurrentUser,
  logout,
};

