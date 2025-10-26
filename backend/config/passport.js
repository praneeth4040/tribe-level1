const passport = require('passport');
const User = require('../models/User');

// Import OAuth strategies
const googleStrategy = require('./strategies/googleStrategy');

// Register strategies
passport.use('google', googleStrategy);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
