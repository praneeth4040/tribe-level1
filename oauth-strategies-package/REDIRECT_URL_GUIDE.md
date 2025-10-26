# REDIRECT URL HANDLING - EXPLAINED

## How It Works

### 1. **Environment Variables**
Each strategy reads the redirect URL from environment variables:

```javascript
callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
// etc for all 7 providers
```

### 2. **Flow**

```
User clicks "Login with Google"
    ↓
Frontend sends to → /auth/google
    ↓
Express route calls → passport.authenticate('google')
    ↓
User redirects to Google's OAuth screen
    ↓
User approves
    ↓
Google redirects back to → GOOGLE_CALLBACK_URL (from env)
    ↓
Express matches route like /auth/google/callback
    ↓
Passport catches it and calls your route handler
    ↓
Route handler (in express-setup.js) redirects to → /dashboard
```

### 3. **Two Parts of Redirect URL**

**Part 1: OAuth Provider Redirect (YOU CONTROL)**
- Set in environment variable: `GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`
- This is what you give to Google, Facebook, etc. in their OAuth app settings
- Google will send user back to this URL

**Part 2: Your App Redirect (YOU CONTROL)**
- After OAuth completes, you redirect to your app route
- Example: `res.redirect('/dashboard')` in the callback handler
- This is in the express-setup.js route handler

### 4. **Setup Steps**

#### Step 1: Create OAuth App
- Go to Google Cloud Console, Facebook Developer, etc.
- Create OAuth app
- Get Client ID and Client Secret

#### Step 2: Set Callback URL in OAuth Provider Settings
- Callback URL setting in OAuth provider = `http://localhost:3000/auth/google/callback`
- Production: `https://yourdomain.com/auth/google/callback`

#### Step 3: Set Environment Variables in Your Backend
```env
GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

FACEBOOK_CLIENT_ID=xxxx
FACEBOOK_CLIENT_SECRET=xxxx
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback
```

#### Step 4: Match Routes in Express App
```javascript
// Route must match the CALLBACK_URL exactly
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
```

---

## IMPORTANT POINTS

### ✅ DO THIS
- Set `GOOGLE_CALLBACK_URL` in your `.env` file
- Make sure Express route matches the callback URL exactly
- Include full domain in production: `https://yourdomain.com/auth/google/callback`

### ❌ DON'T DO THIS
- Don't hardcode URLs in strategy files (they're already dynamic via env vars)
- Don't use different callback URL for OAuth provider vs Express route
- Don't forget to add the callback URL to OAuth provider settings

---

## EXAMPLE

### OAuth Provider Settings (Google Console)
```
Authorized redirect URIs: http://localhost:3000/auth/google/callback
```

### .env File in Backend
```
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=secret123
```

### Express Route (your code)
```javascript
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res) => {
    // User is now authenticated
    res.redirect('/dashboard');
  }
);
```

---

## WHAT PACKAGE HANDLES

✅ Everything about OAuth provider communication
✅ User creation/updating/linking
✅ Token management
✅ Profile data extraction

## WHAT YOU HANDLE

✅ Setting environment variables
✅ Creating OAuth app in each provider's console
✅ Setting callback URL in provider settings
✅ Creating Express routes that match the callback URL
✅ Deciding what to redirect to after auth

---

## For Each Provider

| Provider   | Env Var                   | Default Callback                       |
|-----------|---------------------------|----------------------------------------|
| Google    | GOOGLE_CALLBACK_URL       | /api/auth/google/callback             |
| Facebook  | FACEBOOK_CALLBACK_URL     | /api/auth/facebook/callback           |
| GitHub    | GITHUB_CALLBACK_URL       | /api/auth/github/callback             |
| LinkedIn  | LINKEDIN_CALLBACK_URL     | /api/auth/linkedin/callback           |
| Twitter   | TWITTER_CALLBACK_URL      | /api/auth/twitter/callback            |
| Instagram | INSTAGRAM_CALLBACK_URL    | /api/auth/instagram/callback          |
| Reddit    | REDDIT_CALLBACK_URL       | /api/auth/reddit/callback             |

---

## DEBUGGING

**Problem: "Redirect URI mismatch"**
- Solution: Make sure CALLBACK_URL in .env matches exactly what you registered in OAuth provider settings

**Problem: Route not being called**
- Solution: Check that Express route matches CALLBACK_URL exactly (include /api/ prefix if your env has it)

**Problem: User keeps logging in as different accounts**
- Solution: Check that User model has email field - package links users by email if they don't have provider ID

