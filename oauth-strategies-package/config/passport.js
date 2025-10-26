const passport = require('passport');

/**
 * Setup Passport with all OAuth strategies
 * 
 * @param {object} userModel - Mongoose User model
 * @param {array} providers - Array of provider names to register (optional, default: all)
 * @returns {object} Configured passport instance
 * 
 * @example
 * const passport = require('passport');
 * const setupPassport = require('multi-oauth-strategies/config/passport');
 * const User = require('./models/User');
 * 
 * setupPassport(passport, User, ['google', 'facebook', 'github']);
 */
function setupPassport(passportInstance, userModel, providers = null) {
  if (!userModel) {
    throw new Error('User model is required');
  }

  const strategies = require('../index').strategies;
  const availableProviders = providers || Object.keys(strategies);

  // Register selected strategies
  availableProviders.forEach((provider) => {
    if (!strategies[provider]) {
      console.warn(`Strategy for provider "${provider}" not found`);
      return;
    }
    
    // Each strategy is a factory function that needs the User model
    const strategyInstance = strategies[provider](userModel);
    passportInstance.use(provider, strategyInstance);
  });

  // Serialize user
  passportInstance.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passportInstance.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  return passportInstance;
}

module.exports = setupPassport;
