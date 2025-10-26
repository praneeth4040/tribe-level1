const GoogleStrategy = require('./strategies/googleStrategy');
const FacebookStrategy = require('./strategies/facebookStrategy');
const GitHubStrategy = require('./strategies/githubStrategy');
const LinkedInStrategy = require('./strategies/linkedinStrategy');
const TwitterStrategy = require('./strategies/twitterStrategy');
const InstagramStrategy = require('./strategies/instagramStrategy');
const RedditStrategy = require('./strategies/redditStrategy');
const { handleOAuthCallback } = require('./utils/oauthHandler');
const setupPassport = require('./config/passport');

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
  // Convenience methods
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
