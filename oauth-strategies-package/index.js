const passport = require('passport');
const GoogleStrategy = require('./strategies/googleStrategy');
const FacebookStrategy = require('./strategies/facebookStrategy');
const GitHubStrategy = require('./strategies/githubStrategy');
const LinkedInStrategy = require('./strategies/linkedinStrategy');
const TwitterStrategy = require('./strategies/twitterStrategy');
const InstagramStrategy = require('./strategies/instagramStrategy');
const RedditStrategy = require('./strategies/redditStrategy');
const { handleOAuthCallback } = require('./utils/oauthHandler');
const setupPassport = require('./config/passport');
const session = require('express-session');

/**
 * Initialize Passport middleware automatically
 * This function adds passport.initialize() and passport.session() middleware to the express app
 * 
 * @param {object} app - Express application instance
 * @param {object} sessionMiddleware - Express session middleware instance
 * @returns {void}
 * 
 * @example
 * const express = require('express');
 * const session = require('express-session');
 * const multiOAuth = require('multi-oauth-strategies');
 * 
 * const app = express();
 * const sessionMiddleware = session({ secret: 'your-secret' });
 * 
 * app.use(sessionMiddleware);
 * multiOAuth.initializePassport(app);
 */
function initializePassport(app, sessionMiddleware = null) {
  if (!app) {
    throw new Error('Express app instance is required');
  }

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  return {
    passport: passport,
    initialize: () => app.use(passport.initialize()),
    session: () => app.use(passport.session()),
  };
}

/**
 * Complete OAuth setup with automatic passport initialization
 * This combines session setup, passport initialization, and strategy registration
 * 
 * @param {object} app - Express application instance
 * @param {object} userModel - Mongoose User model
 * @param {array} providers - Array of provider names to register
 * @param {object} sessionConfig - Express session configuration
 * @returns {object} Passport instance and middleware info
 * 
 * @example
 * const express = require('express');
 * const multiOAuth = require('multi-oauth-strategies');
 * const User = require('./models/User');
 * 
 * const app = express();
 * 
 * multiOAuth.initializeOAuth(app, User, ['google', 'facebook', 'github']);
 */
function initializeOAuth(app, userModel, providers = null, sessionConfig = {}) {
  if (!app) {
    throw new Error('Express app instance is required');
  }
  if (!userModel) {
    throw new Error('User model is required');
  }

  
  // Default session configuration
  const defaultSessionConfig = {
    secret: process.env.SESSION_SECRET || 'oauth-default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    ...sessionConfig
  };

  // Setup session middleware
  const sessionMiddleware = session(defaultSessionConfig);
  app.use(sessionMiddleware);

  // Initialize passport middleware
  initializePassport(app, sessionMiddleware);

  // Setup passport strategies and serialization
  setupPassport(passport, userModel, providers);

  return {
    passport: passport,
    sessionMiddleware: sessionMiddleware,
    message: '✓ OAuth initialized with passport automatically'
  };
}

/**
 * Get authentication middleware for a provider
 * This replaces the need for passport.authenticate() in routes
 * 
 * @param {string} provider - OAuth provider name (google, facebook, github, etc.)
 * @param {object} options - Optional passport.authenticate() options
 * @returns {function} Express middleware function
 * 
 * @example
 * const multiOAuth = require('multi-oauth-strategies');
 * 
 * app.get('/auth/google', multiOAuth.authenticate('google', { scope: ['profile', 'email'] }));
 * 
 * app.get('/auth/google/callback', multiOAuth.authenticate('google'), (req, res) => {
 *   res.redirect('/dashboard');
 * });
 */
function authenticate(provider, options = {}) {
  if (!provider) {
    throw new Error('Provider name is required');
  }
  return passport.authenticate(provider, options);
}

/**
 * Authentication middleware with custom options for each provider
 * Provides pre-configured scopes for common providers
 * 
 * @param {string} provider - OAuth provider name
 * @param {object} customOptions - Override default options
 * @returns {function} Express middleware function
 * 
 * @example
 * app.get('/auth/google', multiOAuth.authenticateWithDefaults('google'));
 * app.get('/auth/facebook', multiOAuth.authenticateWithDefaults('facebook'));
 */
function authenticateWithDefaults(provider, customOptions = {}) {
  if (!provider) {
    throw new Error('Provider name is required');
  }

  const defaultScopes = {
    google: { scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'] },
    facebook: { scope: ['public_profile', 'email'] },
    github: { scope: ['user:email'] },
    linkedin: { scope: ['openid', 'profile', 'email'] },
    twitter: {},
    instagram: {},
    reddit: { duration: 'permanent' }
  };

  const options = {
    ...(defaultScopes[provider] || {}),
    ...customOptions
  };

  return passport.authenticate(provider, options);
}

/**
 * Callback authentication middleware with error handling
 * Automatically handles authentication failures
 * 
 * @param {string} provider - OAuth provider name
 * @param {string} failureRedirect - URL to redirect on auth failure
 * @param {object} customOptions - Additional options
 * @returns {function} Express middleware function
 * 
 * @example
 * app.get('/auth/google/callback', 
 *   multiOAuth.authenticateCallback('google', '/error')
 * );
 */
function authenticateCallback(provider, failureRedirect = '/error', customOptions = {}) {
  if (!provider) {
    throw new Error('Provider name is required');
  }

  const options = {
    failureRedirect: failureRedirect,
    failureMessage: true,
    ...customOptions
  };

  return passport.authenticate(provider, options);
}

module.exports = {
  strategies: {
    google: GoogleStrategy,
    facebook: FacebookStrategy,
    github: GitHubStrategy,
    linkedin: LinkedInStrategy,
    twitter: TwitterStrategy,
    instagram: InstagramStrategy,
    reddit: RedditStrategy,
  },
  handlers: {
    handleOAuthCallback,
  },
  setupPassport,
  initializePassport,
  initializeOAuth,
  
  // ===== AUTHENTICATION MIDDLEWARE =====
  /**
   * Simple authentication middleware
   * @example multiOAuth.authenticate('google', { scope: [...] })
   */
  authenticate,
  
  /**
   * Authentication with pre-configured defaults
   * @example multiOAuth.authenticateWithDefaults('google')
   */
  authenticateWithDefaults,
  
  /**
   * Callback authentication with error handling
   * @example multiOAuth.authenticateCallback('google', '/error')
   */
  authenticateCallback,
  
  // ===== CONVENIENCE METHODS =====
  getStrategy: (provider) => {
    const strategies = module.exports.strategies;
    if (!strategies[provider]) {
      throw new Error(`Strategy for provider "${provider}" not found. Available providers: ${Object.keys(strategies).join(', ')}`);
    }
    return strategies[provider];
  },
  getAllStrategies: () => module.exports.strategies,
  registerStrategies: (passport) => {
    const strategies = module.exports.strategies;
    Object.entries(strategies).forEach(([name, strategy]) => {
      passport.use(name, strategy);
    });
  },
};
