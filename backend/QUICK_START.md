# 🚀 Quick Start Guide - Enable First Provider

## Goal: Enable Facebook OAuth in 5 minutes

### Step 1: Install Package (30 seconds)
```bash
cd backend
npm install passport-facebook
```

### Step 2: Get Credentials (2 minutes)
1. Go to https://developers.facebook.com/apps/
2. Create app or select existing
3. Go to Settings → Basic
4. Copy App ID and App Secret

### Step 3: Add to .env (1 minute)
```env
FACEBOOK_CLIENT_ID=your_app_id_here
FACEBOOK_CLIENT_SECRET=your_app_secret_here
```

### Step 4: Enable in Passport (1 minute)
Edit `config/passport.js`:

Add after line with googleStrategy:
```javascript
const facebookStrategy = require('./strategies/facebookStrategy');
passport.use('facebook', facebookStrategy);
```

### Step 5: Uncomment Routes (1 minute)
Edit `routes/route.js`:

Find the commented Facebook section and uncomment:
```javascript
// ============ Facebook OAuth Routes ============
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

### Step 6: Test (1 minute)
1. Start server: `npm start`
2. Visit: `http://localhost:3000/api/auth/facebook`
3. Should see Facebook login
4. After login, should redirect to `/result?accessToken=...`
5. ✅ Success!

---

## One Provider at a Time Pattern

```
Google:    ✅ Already working
Facebook:  🟢 Start here (5 min)
GitHub:    ⏳ Then this one
LinkedIn:  ⏳ Then this one
Twitter:   ⏳ Then this one
Instagram: ⏳ Then this one
Reddit:    ⏳ Then this one
```

---

## Command Reference

```bash
# Install
npm install passport-facebook

# Start server
npm start

# Check if working
curl http://localhost:3000/api/auth/facebook

# MongoDB: Check user was created
db.users.find({ linkedProviders: "facebook" })
```

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install passport-facebook` |
| "Strategy not found" | Check `passport.js` has the `passport.use('facebook', ...)` line |
| "Redirect mismatch" | Check `.env` has correct credentials |
| "User not created" | Check MongoDB connection in logs |
| "No token returned" | Check `FRONTEND_URL` in `.env` is correct |

---

## Next Provider (Same 5 Steps)

Once Facebook works, add GitHub:

1. `npm install passport-github2`
2. Get credentials from https://github.com/settings/developers
3. Add to `.env`: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
4. Uncomment in `config/passport.js`
5. Uncomment in `routes/route.js`

**Same pattern every time!** 🎯

---

## File Locations (Copy/Paste Ready)

**Passport Config:** `/Users/praneeth/Projects/tribe Level 1/tribe-level1/backend/config/passport.js`

**Routes:** `/Users/praneeth/Projects/tribe Level 1/tribe-level1/backend/routes/route.js`

**.env:** `/Users/praneeth/Projects/tribe Level 1/tribe-level1/backend/.env`

**Strategy:** `/Users/praneeth/Projects/tribe Level 1/tribe-level1/backend/config/strategies/facebookStrategy.js`

---

## Need Help?

- Read: `OAUTH_SETUP_GUIDE.md` for detailed info
- Check: `IMPLEMENTATION_CHECKLIST.md` for full steps
- Reference: `CODE_STRUCTURE_REFERENCE.md` for code examples

---

**That's it!** You now have a modular, scalable OAuth system. 🎉
