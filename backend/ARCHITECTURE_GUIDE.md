# Execution Flow Diagram

## Before (Google Only - Monolithic)
```
passport.js (EVERYTHING HERE)
  ├── Google strategy
  ├── Serialize
  └── Deserialize

auth.js
  └── googleCallback()

route.js
  └── /auth/google/*
```

## After (Multi-Provider - Modular) ✨

```
config/
├── passport.js (Clean registry)
│   ├── Register: google
│   ├── Register: facebook (ready)
│   ├── Register: github (ready)
│   └── Serialize/Deserialize
│
└── strategies/ (Organized by provider)
    ├── googleStrategy.js
    ├── facebookStrategy.js
    ├── githubStrategy.js
    ├── linkedinStrategy.js
    ├── twitterStrategy.js
    ├── instagramStrategy.js
    └── redditStrategy.js

utils/
└── oauthHandler.js (Universal callback handler)

components/
└── auth.js
    ├── oauthCallback() [Generic]
    ├── googleCallback() [Google-specific]
    └── getCurrentUser()

routes/
└── route.js
    ├── /api/auth/google/*
    ├── /api/auth/facebook/* (commented)
    ├── /api/auth/github/* (commented)
    └── ... (other providers)
```

## OAuth Flow for ANY Provider

```
1. User clicks "Login with Facebook"
   ↓
2. Frontend redirects to: GET /api/auth/facebook
   ↓
3. Passport triggers facebookStrategy.js
   ↓
4. User completes Facebook login
   ↓
5. Facebook redirects to: GET /api/auth/facebook/callback
   ↓
6. Passport validates & calls facebookStrategy callback
   ↓
7. handleOAuthCallback('facebook', profile, tokens)
   ├── Check if user exists with this provider ID
   ├── If yes → Update tokens & return user
   ├── If no → Check if email exists
   │   ├── If yes → Link provider to existing account
   │   └── If no → Create new user
   ↓
8. authController.oauthCallback('facebook') executes
   ├── Generate JWT tokens
   ├── Save refresh token to DB
   ├── Redirect to frontend with tokens
   ↓
9. Frontend stores tokens and user is logged in ✅
```

## User Account Linking Example

```
Scenario: User signs up with Google, then links Facebook

Initial State:
User {
  email: "user@example.com",
  oauthProviders: {
    google: { id: "google_123", accessToken: "...", refreshToken: "..." }
  },
  linkedProviders: ["google"]
}

Step 1: User clicks "Link Facebook"
Step 2: User completes Facebook auth
Step 3: handleOAuthCallback('facebook', fbProfile) runs
Step 4: Email matches existing user → Link provider

Final State:
User {
  email: "user@example.com",
  oauthProviders: {
    google: { id: "google_123", accessToken: "...", refreshToken: "..." },
    facebook: { id: "fb_456", accessToken: "..." }
  },
  linkedProviders: ["google", "facebook"]
}
```

## Adding a New Provider - Step by Step

```
Package Installation
    ↓
Add Environment Variables
    ↓
✓ Strategy File Already Created (e.g., facebookStrategy.js)
    ↓
Register Strategy in passport.js
    ↓
Uncomment Routes in route.js
    ↓
Test the Provider ✅
```

## File Dependencies

```
routes/route.js
├── components/auth.js
│   ├── models/User.js
│   └── utils/oauthHandler.js
│       └── models/User.js
│
└── config/passport.js
    ├── config/strategies/*.js
    │   └── utils/oauthHandler.js
    │       └── models/User.js
    └── models/User.js
```

## Callback Function Flow

```javascript
// For ANY provider, the pattern is identical:

// 1. Strategy file imports handler
const { handleOAuthCallback } = require('../utils/oauthHandler');

// 2. Strategy calls handler
const user = await handleOAuthCallback('facebook', profile, accessToken, refreshToken);

// 3. Handler does the heavy lifting
// - Create/update/link user

// 4. Controller uses generic callback
authController.oauthCallback('facebook')

// 5. User gets tokens and redirects to frontend
// Pattern is 100% reusable!
```

## Environment Setup

```
.env file structure
├── Database
│   └── MONGODB_URI
├── Server
│   ├── PORT
│   └── FRONTEND_URL
├── JWT
│   └── JWT_SECRET
└── OAuth Providers
    ├── GOOGLE_*
    ├── FACEBOOK_*
    ├── GITHUB_*
    ├── LINKEDIN_*
    ├── TWITTER_*
    ├── INSTAGRAM_*
    └── REDDIT_*
```

## 🎯 Key Insight

All strategies follow this pattern:

```javascript
// config/strategies/providerStrategy.js
const ProviderStrategy = require('passport-provider');

module.exports = new ProviderStrategy(
  {
    clientID: process.env.PROVIDER_CLIENT_ID,
    clientSecret: process.env.PROVIDER_CLIENT_SECRET,
    callbackURL: '/api/auth/provider/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await handleOAuthCallback('provider', profile, accessToken, refreshToken);
    return done(null, user);
  }
);
```

**This pattern works for ALL OAuth 2.0 providers!** 🚀
