# Implementation Checklist

## ✅ What's Already Done

- [x] Refactored User model to support multiple providers
- [x] Created OAuth handler utility (`utils/oauthHandler.js`)
- [x] Created strategy files for all 7 providers
- [x] Updated passport configuration
- [x] Updated auth controller with generic callback
- [x] Updated routes with all provider endpoints (commented)
- [x] Documentation created

## 📋 To Enable Each Provider

### Google ✅ (Already Working)
- [x] Passport strategy created
- [x] Routes configured
- [x] Controller ready
- [x] Existing users automatically migrated to new schema

### Facebook 🔄 (Next Step)
- [ ] Run: `npm install passport-facebook`
- [ ] Get Facebook Client ID and Secret from https://developers.facebook.com/apps/
- [ ] Add to `.env`:
  ```env
  FACEBOOK_CLIENT_ID=your_id
  FACEBOOK_CLIENT_SECRET=your_secret
  ```
- [ ] Uncomment in `config/passport.js`:
  ```javascript
  const facebookStrategy = require('./strategies/facebookStrategy');
  passport.use('facebook', facebookStrategy);
  ```
- [ ] Uncomment routes in `routes/route.js`:
  ```javascript
  router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
  router.get('/auth/facebook/callback', passport.authenticate('facebook', ...), authController.oauthCallback('facebook'));
  ```
- [ ] Test: Visit `http://localhost:3000/api/auth/facebook`

### GitHub 🔄
- [ ] Run: `npm install passport-github2`
- [ ] Get GitHub Client ID and Secret from https://github.com/settings/developers
- [ ] Add to `.env`:
  ```env
  GITHUB_CLIENT_ID=your_id
  GITHUB_CLIENT_SECRET=your_secret
  ```
- [ ] Uncomment in `config/passport.js`
- [ ] Uncomment routes in `routes/route.js`
- [ ] Test: Visit `http://localhost:3000/api/auth/github`

### LinkedIn 🔄
- [ ] Run: `npm install passport-linkedin-oauth2`
- [ ] Get credentials from https://www.linkedin.com/developers/apps/
- [ ] Add to `.env`:
  ```env
  LINKEDIN_CLIENT_ID=your_id
  LINKEDIN_CLIENT_SECRET=your_secret
  ```
- [ ] Uncomment in `config/passport.js`
- [ ] Uncomment routes in `routes/route.js`
- [ ] Test: Visit `http://localhost:3000/api/auth/linkedin`

### Twitter 🔄
- [ ] Run: `npm install passport-twitter`
- [ ] Get credentials from https://developer.twitter.com/en/portal/dashboard
- [ ] Add to `.env`:
  ```env
  TWITTER_CONSUMER_KEY=your_key
  TWITTER_CONSUMER_SECRET=your_secret
  ```
- [ ] Uncomment in `config/passport.js`
- [ ] Uncomment routes in `routes/route.js`
- [ ] Test: Visit `http://localhost:3000/api/auth/twitter`

### Instagram 🔄
- [ ] Run: `npm install passport-instagram`
- [ ] Get credentials from https://developers.facebook.com/apps/
- [ ] Add to `.env`:
  ```env
  INSTAGRAM_CLIENT_ID=your_id
  INSTAGRAM_CLIENT_SECRET=your_secret
  ```
- [ ] Uncomment in `config/passport.js`
- [ ] Uncomment routes in `routes/route.js`
- [ ] Test: Visit `http://localhost:3000/api/auth/instagram`

### Reddit 🔄
- [ ] Run: `npm install passport-reddit`
- [ ] Get credentials from https://www.reddit.com/prefs/apps
- [ ] Add to `.env`:
  ```env
  REDDIT_CLIENT_ID=your_id
  REDDIT_CLIENT_SECRET=your_secret
  ```
- [ ] Uncomment in `config/passport.js`
- [ ] Uncomment routes in `routes/route.js`
- [ ] Test: Visit `http://localhost:3000/api/auth/reddit`

## 🧪 Testing Each Provider

For each provider:
1. **Start your server**: `npm start`
2. **Visit**: `http://localhost:3000/api/auth/{provider}`
3. **Follow provider's login flow**
4. **Should redirect to**: `http://localhost:5173/result?accessToken=...&refreshToken=...&userId=...&provider={provider}`
5. **Check MongoDB**: User should have provider entry in `oauthProviders.{provider}`

## 📝 Frontend Updates Needed

Your frontend might need updates to:
- [x] Display multiple provider buttons
- [ ] Show "Link Account" option for existing users
- [ ] Display linked providers in profile
- [ ] Handle provider-specific profile data (some providers have different field names)

## 🔧 Troubleshooting Checklist

### Provider login not working?
- [ ] Check `.env` has correct credentials
- [ ] Check callback URL matches in provider's console
- [ ] Check strategy file is registered in `passport.js`
- [ ] Check routes are uncommented
- [ ] Check browser console for errors
- [ ] Check server logs for detailed errors

### User not being created?
- [ ] Check MongoDB connection
- [ ] Check User model has migrations applied
- [ ] Check `oauthHandler.js` is imported correctly
- [ ] Look for errors in server logs

### Tokens not returned?
- [ ] Check `JWT_SECRET` is set in `.env`
- [ ] Check `FRONTEND_URL` is correct in `.env`
- [ ] Check `authController.oauthCallback()` is called
- [ ] Check MongoDB `refreshToken` save succeeded

## 📊 Progress Tracking

```
Google:    ✅ Done
Facebook:  ⏳ Ready to implement
GitHub:    ⏳ Ready to implement
LinkedIn:  ⏳ Ready to implement
Twitter:   ⏳ Ready to implement
Instagram: ⏳ Ready to implement
Reddit:    ⏳ Ready to implement
```

## 📚 Documentation Files Created

- `OAUTH_SETUP_GUIDE.md` - Complete setup guide
- `ARCHITECTURE_GUIDE.md` - Visual flow diagrams
- `REFACTORING_SUMMARY.md` - What changed and why
- `PACKAGES_SETUP.md` - Package installation commands
- `IMPLEMENTATION_CHECKLIST.md` - This file
- `config/strategies/PROVIDER_SETUP_GUIDE.md` - Code comments

## 🚀 Recommended Order

Start with the easiest:
1. **GitHub** - Simple, great for testing
2. **Facebook** - Most popular
3. **LinkedIn** - Professional network
4. **Twitter** - Real-time engagement
5. **Reddit** - Community-driven
6. **Instagram** - Visual content

## 💡 Tips

1. **Test one at a time** - Don't enable all at once
2. **Use browser DevTools** - Check Network tab for redirects
3. **Read error messages** - They usually tell you what's wrong
4. **Check MongoDB directly** - Verify user data is being saved
5. **Start with a simple provider** - GitHub is easiest

## 🎯 Success Criteria

Provider is working when:
- ✅ User can log in via provider
- ✅ User data is saved in MongoDB
- ✅ Tokens are returned to frontend
- ✅ User can logout
- ✅ User can login again and get same account

---

**Need help?** Check the documentation files or review the strategy files - they follow the same pattern!
