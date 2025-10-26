# OAuth Provider Setup Guide

This guide explains the refactored OAuth structure and how to add new providers.

## 📁 New Directory Structure

```
backend/
├── config/
│   ├── passport.js                 # Main passport configuration
│   └── strategies/
│       ├── googleStrategy.js       # Google OAuth strategy
│       ├── facebookStrategy.js     # Facebook OAuth strategy
│       ├── githubStrategy.js       # GitHub OAuth strategy
│       ├── linkedinStrategy.js     # LinkedIn OAuth strategy
│       ├── twitterStrategy.js      # Twitter OAuth strategy
│       ├── instagramStrategy.js    # Instagram OAuth strategy
│       ├── redditStrategy.js       # Reddit OAuth strategy
│       └── PROVIDER_SETUP_GUIDE.md # Detailed setup guide
├── utils/
│   └── oauthHandler.js             # Shared OAuth callback handler
├── models/
│   └── User.js                     # Updated User schema
├── components/
│   └── auth.js                     # Auth controller
└── routes/
    └── route.js                    # Routes with provider endpoints
```

## 🔄 How It Works

### 1. **Modular Strategy Files** 
Each OAuth provider has its own strategy file in `config/strategies/`. All strategies use the generic `handleOAuthCallback` function.

### 2. **Generic OAuth Handler**
The `oauthHandler.js` utility handles user creation/update for all providers:
- Creates new users
- Links multiple providers to one account
- Updates provider tokens

### 3. **Updated User Schema**
The User model now supports multiple OAuth providers:
```javascript
oauthProviders: {
  google: { id, accessToken, refreshToken },
  facebook: { id, accessToken },
  github: { id, accessToken },
  // ... other providers
}
linkedProviders: ['google', 'facebook'] // Tracks which providers are linked
```

## 🚀 Quick Start - Add a New Provider

### Example: Adding Facebook OAuth

#### Step 1: Install the package
```bash
npm install passport-facebook
```

#### Step 2: Add environment variables to `.env`
```env
FACEBOOK_CLIENT_ID=your_client_id
FACEBOOK_CLIENT_SECRET=your_client_secret
```

#### Step 3: Strategy is already created!
The `facebookStrategy.js` file is ready to use.

#### Step 4: Enable in `config/passport.js`
```javascript
const facebookStrategy = require('./strategies/facebookStrategy');
passport.use('facebook', facebookStrategy);
```

#### Step 5: Uncomment routes in `routes/route.js`
```javascript
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/result?error=facebook_auth_failed' }),
  authController.oauthCallback('facebook')
);
```

## 📋 Provider Setup Instructions

### Google (Already Configured ✓)
- **Console**: https://console.developers.google.com/
- **Scopes**: `profile`, `email`
- **Package**: `passport-google-oauth20`

### Facebook
- **Console**: https://developers.facebook.com/apps/
- **Scopes**: `public_profile`, `email`
- **Package**: `passport-facebook`
- **Profile Fields**: `id`, `displayName`, `photos`, `email`

### GitHub
- **Console**: https://github.com/settings/developers
- **Scopes**: `user:email`
- **Package**: `passport-github2`

### LinkedIn
- **Console**: https://www.linkedin.com/developers/apps/
- **Scopes**: `r_basicprofile`, `r_emailaddress`
- **Package**: `passport-linkedin-oauth2`

### Twitter
- **Console**: https://developer.twitter.com/en/portal/dashboard
- **API**: v1.1 with OAuth 1.0a
- **Package**: `passport-twitter`
- **Note**: Use `includeEmail: true` option

### Instagram (via Facebook)
- **Console**: https://developers.facebook.com/apps/
- **Scopes**: `instagram_basic`
- **Package**: `passport-instagram`

### Reddit
- **Console**: https://www.reddit.com/prefs/apps
- **Scopes**: `identity`
- **Package**: `passport-reddit`

## 🔑 Frontend Integration

When a user authenticates, they're redirected to:
```
/result?accessToken=TOKEN&refreshToken=REFRESH&userId=ID&provider=PROVIDER_NAME
```

The frontend can now handle multiple providers in the same result page.

## 📝 User Data Structure

After authentication, users will have this structure:
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  profilePic: "https://...",
  oauthProviders: {
    google: {
      id: "google_id",
      accessToken: "token",
      refreshToken: "token"
    },
    facebook: {
      id: "facebook_id",
      accessToken: "token"
    }
  },
  linkedProviders: ["google", "facebook"],
  createdAt: Date,
  updatedAt: Date
}
```

## 🛠️ Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb+srv://...

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Facebook OAuth (uncomment when enabled)
# FACEBOOK_CLIENT_ID=...
# FACEBOOK_CLIENT_SECRET=...

# GitHub OAuth (uncomment when enabled)
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...

# LinkedIn OAuth (uncomment when enabled)
# LINKEDIN_CLIENT_ID=...
# LINKEDIN_CLIENT_SECRET=...

# Twitter OAuth (uncomment when enabled)
# TWITTER_CONSUMER_KEY=...
# TWITTER_CONSUMER_SECRET=...

# Instagram OAuth (uncomment when enabled)
# INSTAGRAM_CLIENT_ID=...
# INSTAGRAM_CLIENT_SECRET=...

# Reddit OAuth (uncomment when enabled)
# REDDIT_CLIENT_ID=...
# REDDIT_CLIENT_SECRET=...
```

## 🧪 Testing Locally

1. Get credentials from each provider's developer console
2. Add them to `.env`
3. Enable the provider in `config/passport.js`
4. Uncomment routes in `routes/route.js`
5. Test by navigating to `http://localhost:3000/api/auth/{provider}`

## 🔐 Best Practices

1. **Never commit `.env`** - Add to `.gitignore`
2. **Use environment variables** for all credentials
3. **Update profile pic field** - Each provider returns profile pics differently
4. **Store refresh tokens** - For providers that support them
5. **Handle errors gracefully** - Redirect to error page with provider info

## 📚 Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [OAuth 2.0 Guide](https://oauth.net/2/)
- Individual provider documentation links in `PROVIDER_SETUP_GUIDE.md`
