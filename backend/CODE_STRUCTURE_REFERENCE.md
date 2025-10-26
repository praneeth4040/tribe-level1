# Code Structure Reference

## File Organization

```
backend/
│
├── 📄 OAUTH_SETUP_GUIDE.md ........................ Full setup documentation
├── 📄 ARCHITECTURE_GUIDE.md ....................... Flow diagrams & architecture
├── 📄 REFACTORING_SUMMARY.md ...................... What changed and why
├── 📄 IMPLEMENTATION_CHECKLIST.md ................. Step-by-step checklist
├── 📄 PACKAGES_SETUP.md ........................... Package installation guide
│
├── config/
│   ├── 📄 passport.js ............................ Clean passport registry
│   │   ```
│   │   const passport = require('passport');
│   │   const googleStrategy = require('./strategies/googleStrategy');
│   │   
│   │   passport.use('google', googleStrategy);
│   │   // Add more: passport.use('facebook', facebookStrategy);
│   │   
│   │   passport.serializeUser((user, done) => { ... });
│   │   passport.deserializeUser((id, done) => { ... });
│   │   ```
│   │
│   └── strategies/
│       ├── 📄 googleStrategy.js .................. ✅ Google OAuth
│       ├── 📄 facebookStrategy.js ............... 🔄 Ready to enable
│       ├── 📄 githubStrategy.js ................. 🔄 Ready to enable
│       ├── 📄 linkedinStrategy.js ............... 🔄 Ready to enable
│       ├── 📄 twitterStrategy.js ................ 🔄 Ready to enable
│       ├── 📄 instagramStrategy.js .............. 🔄 Ready to enable
│       ├── 📄 redditStrategy.js ................. 🔄 Ready to enable
│       └── 📄 PROVIDER_SETUP_GUIDE.md .......... Code examples
│
├── utils/
│   └── 📄 oauthHandler.js ........................ Generic OAuth callback handler
│       ```
│       async function handleOAuthCallback(provider, profile, accessToken, refreshToken)
│       - Checks if user exists with this provider
│       - If not: checks by email (for linking)
│       - If not: creates new user
│       - Returns updated/created user
│       ```
│
├── models/
│   └── 📄 User.js ............................... Updated schema with provider support
│       ```
│       oauthProviders: {
│         google: { id, accessToken, refreshToken },
│         facebook: { id, accessToken },
│         // ... other providers
│       }
│       linkedProviders: ['google', 'facebook']
│       ```
│
├── components/
│   └── 📄 auth.js ............................... Auth controller
│       ```
│       oauthCallback(provider) - Generic callback for all providers
│       googleCallback - Google-specific (wrapper around oauthCallback)
│       getCurrentUser(req, res)
│       logout(req, res)
│       ```
│
└── routes/
    └── 📄 route.js .............................. All provider routes
        ```
        GET /auth/google - ✅ Active
        GET /auth/google/callback
        
        GET /auth/facebook - 🔄 Uncomment to enable
        GET /auth/facebook/callback
        
        // Similar for: github, linkedin, twitter, instagram, reddit
        
        GET /auth/me - Get current user
        POST /auth/logout - Logout
        ```
```

## Key File Comparisons

### Before vs After: User Model

**Before:**
```javascript
{
  googleId: String,      // Only Google
  email: String,
  name: String,
  profilePic: String
}
```

**After:**
```javascript
{
  email: String,
  name: String,
  profilePic: String,
  oauthProviders: {      // All providers
    google: { id, accessToken, refreshToken },
    facebook: { id, accessToken },
    github: { id, accessToken },
    // ... etc
  },
  linkedProviders: [String] // Track what's linked
}
```

### Before vs After: Passport Config

**Before (Monolithic):**
```javascript
// 80+ lines all in one file
passport.use(new GoogleStrategy({ ... }, async (at, rt, profile, done) => {
  // All Google logic here
}));
```

**After (Clean):**
```javascript
// 25 lines - just registration
const googleStrategy = require('./strategies/googleStrategy');
passport.use('google', googleStrategy);

const facebookStrategy = require('./strategies/facebookStrategy');
passport.use('facebook', facebookStrategy);
// ... etc
```

### Strategy Pattern

All strategies follow this identical pattern:

```javascript
// config/strategies/{provider}Strategy.js

const Strategy = require('passport-{provider}').Strategy;
const { handleOAuthCallback } = require('../utils/oauthHandler');

module.exports = new Strategy(
  {
    clientID: process.env.{PROVIDER}_CLIENT_ID,
    clientSecret: process.env.{PROVIDER}_CLIENT_SECRET,
    callbackURL: '/api/auth/{provider}/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleOAuthCallback('{provider}', profile, accessToken, refreshToken);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
);
```

**This pattern is 100% reusable!**

## OAuth Handler Logic

```javascript
// utils/oauthHandler.js

async function handleOAuthCallback(provider, profile, accessToken, refreshToken) {
  // 1. Try to find existing user by provider ID
  let user = await User.findOne({
    [`oauthProviders.${provider}.id`]: profile.id,
  });
  
  if (user) {
    // Update tokens and return
    user.oauthProviders[provider] = { id, accessToken, refreshToken };
    await user.save();
    return user;
  }
  
  // 2. Try to find by email (for linking)
  user = await User.findOne({ email: profile.email });
  
  if (user) {
    // Link new provider to existing account
    user.oauthProviders[provider] = { id, accessToken, refreshToken };
    user.linkedProviders.push(provider);
    await user.save();
    return user;
  }
  
  // 3. Create new user
  user = new User({
    email: profile.email,
    name: profile.displayName,
    oauthProviders: { [provider]: { id, accessToken, refreshToken } },
    linkedProviders: [provider],
  });
  
  await user.save();
  return user;
}
```

## Routes Organization

```javascript
// routes/route.js

// ============ Google OAuth Routes ============
router.get('/auth/google', passport.authenticate('google', { scope: [...] }));
router.get('/auth/google/callback', passport.authenticate('google', ...), authController.googleCallback);

// ============ Facebook OAuth Routes ============
// router.get('/auth/facebook', passport.authenticate('facebook', { scope: [...] }));
// router.get('/auth/facebook/callback', passport.authenticate('facebook', ...), authController.oauthCallback('facebook'));

// ... same pattern for all providers

// ============ Protected Routes ============
router.get('/auth/me', authController.getCurrentUser);
router.post('/auth/logout', authController.logout);
```

## Adding a New Provider - 4 Steps

```
Step 1: Strategy Already Created ✓
└── config/strategies/{provider}Strategy.js (ready to go)

Step 2: Enable in Passport (3 lines)
├── const {provider}Strategy = require('./strategies/{provider}Strategy');
└── passport.use('{provider}', {provider}Strategy);

Step 3: Uncomment Routes (2 endpoints)
├── router.get('/auth/{provider}', ...)
└── router.get('/auth/{provider}/callback', ...)

Step 4: Add to .env (2 variables)
├── {PROVIDER}_CLIENT_ID=...
└── {PROVIDER}_CLIENT_SECRET=...

Done! ✅
```

## Common Issues & Solutions

### Issue: "Strategy not found"
**Cause:** Strategy not registered in `passport.js`
**Fix:** Add these 2 lines to `config/passport.js`:
```javascript
const strategy = require('./strategies/facebookStrategy');
passport.use('facebook', strategy);
```

### Issue: "User not created"
**Cause:** `handleOAuthCallback` not working
**Fix:** Check:
- Strategy file calls `handleOAuthCallback`
- `oauthHandler.js` is imported
- User model schema matches

### Issue: "Cannot find module"
**Cause:** Package not installed
**Fix:** Run `npm install passport-facebook`

### Issue: "Redirect URI mismatch"
**Cause:** Callback URL doesn't match provider settings
**Fix:** Verify:
- Strategy has: `/api/auth/facebook/callback`
- Provider console has same URL

## Best Practices Applied

✅ **DRY (Don't Repeat Yourself)** - Single handler for all providers
✅ **Single Responsibility** - Each file has one job
✅ **Scalability** - Adding providers is 4 simple steps
✅ **Maintainability** - Easy to find and update provider logic
✅ **Testability** - Each strategy is independent
✅ **Security** - Credentials in environment variables

---

**Remember:** Every provider strategy follows the exact same pattern. Once you understand one, you understand them all! 🚀
