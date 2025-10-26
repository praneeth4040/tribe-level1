# multi-oauth-strategies

🔐 **Pre-configured OAuth strategies for Passport.js** - Support for Google, Facebook, GitHub, LinkedIn, Twitter, Instagram, and Reddit

## Features

✅ **7 OAuth Providers** - Google, Facebook, GitHub, LinkedIn, Twitter, Instagram, Reddit
✅ **Automatic User Management** - Create, update, and link accounts automatically
✅ **Account Linking** - Link multiple OAuth providers to one user account
✅ **Zero Configuration** - Just pass your User model and environment variables
✅ **TypeScript Support** - Full type definitions included
✅ **Production Ready** - Battle-tested, secure, and optimized

## Installation

```bash
npm install multi-oauth-strategies
```

## Quick Start

### 1. Set up environment variables

```env
# Google
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Facebook
FACEBOOK_CLIENT_ID=your_client_id
FACEBOOK_CLIENT_SECRET=your_client_secret
FACEBOOK_CALLBACK_URL=/api/auth/facebook/callback

# GitHub
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=/api/auth/github/callback

# LinkedIn
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_CALLBACK_URL=/api/auth/linkedin/callback

# Twitter
TWITTER_CONSUMER_KEY=your_key
TWITTER_CONSUMER_SECRET=your_secret
TWITTER_CALLBACK_URL=/api/auth/twitter/callback

# Instagram
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
INSTAGRAM_CALLBACK_URL=/api/auth/instagram/callback

# Reddit
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_CALLBACK_URL=/api/auth/reddit/callback
```

### 2. Configure Passport

```javascript
const passport = require('passport');
const express = require('express');
const oauthStrategies = require('multi-oauth-strategies');
const User = require('./models/User');

const app = express();

// Create strategies with your User model
const googleStrategy = require('multi-oauth-strategies/strategies/googleStrategy')(User);
const facebookStrategy = require('multi-oauth-strategies/strategies/facebookStrategy')(User);
const githubStrategy = require('multi-oauth-strategies/strategies/githubStrategy')(User);

// Register with passport
passport.use('google', googleStrategy);
passport.use('facebook', facebookStrategy);
passport.use('github', githubStrategy);

// Serialize/deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
```

### 3. Add routes

```javascript
const express = require('express');
const passport = require('passport');

const router = express.Router();

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect(`http://localhost:3000?token=${generateToken(req.user._id)}`);
});

// Facebook OAuth
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  res.redirect(`http://localhost:3000?token=${generateToken(req.user._id)}`);
});

// GitHub OAuth
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github'), (req, res) => {
  res.redirect(`http://localhost:3000?token=${generateToken(req.user._id)}`);
});

module.exports = router;
```

### 4. Set up User Model

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  profilePic: String,
  oauthProviders: {
    google: { id: String, accessToken: String, refreshToken: String },
    facebook: { id: String, accessToken: String },
    github: { id: String, accessToken: String },
    linkedin: { id: String, accessToken: String },
    twitter: { id: String, accessToken: String },
    instagram: { id: String, accessToken: String },
    reddit: { id: String, accessToken: String },
  },
  linkedProviders: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
```

## Usage Examples

### Register all strategies at once

```javascript
const oauthStrategies = require('multi-oauth-strategies');
const User = require('./models/User');

// Register all strategies
oauthStrategies.registerStrategies(passport);

// Or get individual strategies
const googleStrategy = oauthStrategies.strategies.google(User);
const facebookStrategy = oauthStrategies.strategies.facebook(User);
```

### Get specific strategy

```javascript
const oauthStrategies = require('multi-oauth-strategies');
const strategy = oauthStrategies.getStrategy('github');
// Returns the GitHub strategy
```

### Use the OAuth handler directly

```javascript
const { handleOAuthCallback } = require('multi-oauth-strategies/utils/oauthHandler');
const User = require('./models/User');

// In your custom strategy
const user = await handleOAuthCallback('custom', profile, accessToken, refreshToken, User);
```

## Available Providers

| Provider | Environment Variables | Scope |
|----------|----------------------|-------|
| **Google** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `profile`, `email` |
| **Facebook** | `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | `public_profile`, `email` |
| **GitHub** | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | `user:email` |
| **LinkedIn** | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | `r_basicprofile`, `r_emailaddress` |
| **Twitter** | `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET` | `email` |
| **Instagram** | `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET` | `user_profile` |
| **Reddit** | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | `identity` |

## API Reference

### `strategies`

Object containing all available strategies:
```javascript
{
  google: Strategy,
  facebook: Strategy,
  github: Strategy,
  linkedin: Strategy,
  twitter: Strategy,
  instagram: Strategy,
  reddit: Strategy
}
```

### `getStrategy(provider: string): Strategy`

Get a specific strategy by name.

```javascript
const strategy = oauthStrategies.getStrategy('google');
```

### `getAllStrategies(): Object`

Get all available strategies.

```javascript
const strategies = oauthStrategies.getAllStrategies();
```

### `registerStrategies(passport: Object): void`

Register all strategies with Passport.

```javascript
oauthStrategies.registerStrategies(passport);
```

### `handleOAuthCallback(provider, profile, accessToken, refreshToken, userModel): Promise`

Handle OAuth callback - creates/updates/links users.

```javascript
const user = await handleOAuthCallback('google', profile, accessToken, refreshToken, User);
```

## Features

### Automatic User Creation
When a user logs in for the first time, their account is automatically created with their profile information.

### Account Linking
If a user already exists (by email), additional OAuth providers are automatically linked to their account.

### Token Management
Access tokens and refresh tokens (when available) are securely stored in the database.

### Multi-Provider Support
Users can link multiple OAuth providers to a single account for flexible login options.

## Best Practices

1. **Always validate environment variables** before starting your server
2. **Use HTTPS in production** - OAuth callbacks must use HTTPS
3. **Store tokens securely** - Never expose them in frontend code
4. **Implement rate limiting** - Prevent brute force attacks
5. **Use `includeEmail` scope** - Ensures email is retrieved from provider
6. **Test each provider** - Each has different field structures

## Troubleshooting

### "Strategy not found"
Make sure you've required the strategy and passed your User model:
```javascript
const strategy = require('multi-oauth-strategies/strategies/googleStrategy')(User);
```

### "User model is required"
Pass your User model to the strategy constructor:
```javascript
const googleStrategy = require('multi-oauth-strategies/strategies/googleStrategy');
const strategy = googleStrategy(User); // ← Pass User model
```

### "Email not found"
Some providers don't include email by default. Make sure to request appropriate scopes:
```javascript
passport.authenticate('provider', { scope: ['email', 'profile'] })
```

### "Callback URL mismatch"
Ensure the callback URL in your environment variable matches exactly with what's registered in the provider's console.

## Environment Variables

Each strategy looks for specific environment variables:

```env
{PROVIDER}_CLIENT_ID
{PROVIDER}_CLIENT_SECRET
{PROVIDER}_CALLBACK_URL  # Optional, defaults to /api/auth/{provider}/callback

# For Twitter (uses different naming)
TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET
TWITTER_CALLBACK_URL
```

## Database Schema

Your User model should have this structure:

```javascript
{
  email: String,           // Unique identifier
  name: String,            // User's display name
  profilePic: String,      // Profile picture URL
  oauthProviders: {        // OAuth provider data
    google: {
      id: String,
      accessToken: String,
      refreshToken: String
    },
    // ... other providers
  },
  linkedProviders: [String], // ['google', 'facebook', 'github']
  createdAt: Date,
  updatedAt: Date
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for developers**
