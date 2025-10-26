# Package Installation Guide

## Current Packages (Already Installed)
- passport
- passport-google-oauth20
- express-session

## Packages to Install for Each Provider

### All Providers at Once
```bash
npm install passport-facebook passport-github2 passport-linkedin-oauth2 passport-twitter passport-instagram passport-reddit
```

### Or Install Individually

#### Facebook
```bash
npm install passport-facebook
# Add to .env: FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
# Then uncomment in config/passport.js and routes/route.js
```

#### GitHub
```bash
npm install passport-github2
# Add to .env: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
# Then uncomment in config/passport.js and routes/route.js
```

#### LinkedIn
```bash
npm install passport-linkedin-oauth2
# Add to .env: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
# Then uncomment in config/passport.js and routes/route.js
```

#### Twitter
```bash
npm install passport-twitter
# Add to .env: TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET
# Then uncomment in config/passport.js and routes/route.js
```

#### Instagram
```bash
npm install passport-instagram
# Add to .env: INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET
# Then uncomment in config/passport.js and routes/route.js
```

#### Reddit
```bash
npm install passport-reddit
# Add to .env: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET
# Then uncomment in config/passport.js and routes/route.js
```

## Verification

After installation, verify the packages are installed:
```bash
npm list passport-facebook passport-github2 passport-linkedin-oauth2 passport-twitter passport-instagram passport-reddit
```

## Current package.json Structure (Example)
```json
{
  "dependencies": {
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "express-session": "^1.17.3",
    "passport-facebook": "^3.0.0",
    "passport-github2": "^0.1.12",
    "passport-linkedin-oauth2": "^2.1.1",
    "passport-twitter": "^1.0.4",
    "passport-instagram": "^1.0.0",
    "passport-reddit": "^1.0.0"
  }
}
```

## Troubleshooting

### Package not found error
```bash
# Clear npm cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

### Module not found after installing
```bash
# Verify installation
npm list passport-facebook

# If still missing, try individual installation
npm install --save passport-facebook
```

### Version conflicts
Most passport strategies are compatible with passport 0.6.0+. If you have issues:
```bash
npm update passport
```
