# Quick Setup Guide

## For NPM Package Users

### Step 1: Install the package

```bash
npm install multi-oauth-strategies
```

### Step 2: Set environment variables

Create a `.env` file:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Server
PORT=3000
SESSION_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=/api/auth/facebook/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=/api/auth/github/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=/api/auth/linkedin/callback

# Twitter OAuth
TWITTER_CONSUMER_KEY=your_twitter_key
TWITTER_CONSUMER_SECRET=your_twitter_secret
TWITTER_CALLBACK_URL=/api/auth/twitter/callback

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_CALLBACK_URL=/api/auth/instagram/callback

# Reddit OAuth
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_CALLBACK_URL=/api/auth/reddit/callback
```

### Step 3: Create User Model

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  profilePic: String,
  oauthProviders: {
    google: {
      id: String,
      accessToken: String,
      refreshToken: String,
    },
    facebook: {
      id: String,
      accessToken: String,
    },
    github: {
      id: String,
      accessToken: String,
    },
    linkedin: {
      id: String,
      accessToken: String,
    },
    twitter: {
      id: String,
      accessToken: String,
    },
    instagram: {
      id: String,
      accessToken: String,
    },
    reddit: {
      id: String,
      accessToken: String,
    },
  },
  linkedProviders: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
```

### Step 4: Setup Express Server

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI);

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true },
}));

app.use(passport.initialize());
app.use(passport.session());

// ============ Setup OAuth Strategies ============

// Import strategies
const googleStrategy = require('multi-oauth-strategies/strategies/googleStrategy');
const facebookStrategy = require('multi-oauth-strategies/strategies/facebookStrategy');
const githubStrategy = require('multi-oauth-strategies/strategies/githubStrategy');

// Create strategies with User model
passport.use('google', googleStrategy(User));
passport.use('facebook', facebookStrategy(User));
passport.use('github', githubStrategy(User));

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

// ============ Routes ============

// Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect('/dashboard');
});

// Facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  res.redirect('/dashboard');
});

// GitHub
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate('github'), (req, res) => {
  res.redirect('/dashboard');
});

// Get current user
app.get('/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: req.user });
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Logged out' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 5: Get Credentials from Providers

#### Google
1. Go to https://console.developers.google.com/
2. Create new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web Application)
5. Set authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Client Secret

#### Facebook
1. Go to https://developers.facebook.com/apps/
2. Create new app
3. Add "Facebook Login" product
4. Settings → Basic → Copy App ID and App Secret
5. Settings → Facebook Login → Authorized redirect URIs: `http://localhost:3000/api/auth/facebook/callback`

#### GitHub
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Client Secret

#### LinkedIn
1. Go to https://www.linkedin.com/developers/apps/
2. Create app
3. Auth → Authorized redirect URLs: `http://localhost:3000/api/auth/linkedin/callback`
4. Copy Client ID and Client Secret

#### Twitter
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create new app
3. Setup → Set Callback URLs: `http://localhost:3000/api/auth/twitter/callback`
4. Keys and tokens → Copy API Key and API Secret

#### Instagram
1. Go to https://developers.facebook.com/apps/
2. Create app (if not already)
3. Add Instagram Basic Display
4. Settings: Redirect URI: `http://localhost:3000/api/auth/instagram/callback`
5. Copy Client ID and Client Secret

#### Reddit
1. Go to https://www.reddit.com/prefs/apps
2. Create application
3. Redirect URI: `http://localhost:3000/api/auth/reddit/callback`
4. Copy Client ID and Client Secret

### Step 6: Run Your Server

```bash
npm install
npm start
```

### Step 7: Test OAuth Flow

Visit: `http://localhost:3000/auth/google` to test Google login

## All Providers Registered

To register all providers at once:

```javascript
const oauthStrategies = require('multi-oauth-strategies');

// This registers all strategies
oauthStrategies.registerStrategies(passport);
```

Then uncomment all routes in your Express app.

## Troubleshooting

### "ENOENT: no such file or directory"
Make sure all strategies are in node_modules after installation:
```bash
npm install multi-oauth-strategies
npm list multi-oauth-strategies
```

### "Strategy not registered"
Make sure you're registering strategies BEFORE using them:
```javascript
passport.use('google', googleStrategy(User)); // Register first

app.get('/auth/google', passport.authenticate('google')); // Then use
```

### "User model required"
Always pass User model when creating strategy:
```javascript
// ❌ Wrong
const strategy = googleStrategy;

// ✅ Correct
const strategy = googleStrategy(User);
```

### "Callback URL mismatch"
Ensure callback URL in `.env` matches exactly with provider's console:
- Environment: `/api/auth/google/callback`
- Provider console: Must be exactly: `http://localhost:3000/api/auth/google/callback`

## Next Steps

1. Add all 7 providers to your app
2. Build UI for login buttons
3. Store tokens for API calls
4. Implement token refresh
5. Add profile linking UI

---

That's it! You now have multi-provider OAuth authentication. 🎉
