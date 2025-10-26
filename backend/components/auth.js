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

module.exports = {
  googleCallback,
};
