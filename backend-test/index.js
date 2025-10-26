require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const multiOAuth = require('multi-oauth-strategies');

const User = require('./models/User');

const app = express();

// ===== CORS & CREDENTIALS =====
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOptions.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ===== DATABASE =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tribe-oauth-test')
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB error:', err));

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ===== SETUP PASSPORT WITH PACKAGE =====
multiOAuth.setupPassport(passport, User, ['google', 'facebook', 'github', 'linkedin', 'twitter', 'instagram', 'reddit']);

// ===== DEBUG ENDPOINT =====
app.get('/debug/session', (req, res) => {
  res.json({
    user: req.user || null,
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    sessionID: req.sessionID,
    cookies: req.headers.cookie
  });
});

// ===== TEST HOME =====
app.get('/', (req, res) => {
  res.json({
    message: '🚀 OAuth Test Server Running',
    baseUrl: 'http://localhost:4000',
    endpoints: {
      'LOGIN': {
        'Google': 'http://localhost:4000/auth/google',
        'Facebook': 'http://localhost:4000/auth/facebook',
        'GitHub': 'http://localhost:4000/auth/github',
        'LinkedIn': 'http://localhost:4000/auth/linkedin',
        'Twitter': 'http://localhost:4000/auth/twitter',
        'Instagram': 'http://localhost:4000/auth/instagram',
        'Reddit': 'http://localhost:4000/auth/reddit'
      },
      'CHECK': 'http://localhost:4000/auth/me',
      'LOGOUT': 'POST http://localhost:4000/auth/logout',
      'DB_USERS': 'http://localhost:4000/users'
    }
  });
});

// ===== GOOGLE =====
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    // Redirect to frontend dashboard on success
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ===== FACEBOOK =====
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ===== GITHUB =====
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ===== LINKEDIN =====
app.get('/auth/linkedin',
  passport.authenticate('linkedin', { scope: ['openid', 'profile', 'email'] })
);

app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ===== TWITTER =====
app.get('/auth/twitter',
  passport.authenticate('twitter')
);

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ===== INSTAGRAM =====
app.get('/auth/instagram',
  passport.authenticate('instagram')
);

app.get('/auth/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ===== REDDIT =====
app.get('/auth/reddit',
  passport.authenticate('reddit', { duration: 'permanent' })
);

app.get('/auth/reddit/callback',
  passport.authenticate('reddit', { failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ===== GET CURRENT USER =====
app.get('/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: '❌ Not logged in',
      login_urls: {
        google: 'http://localhost:4000/auth/google',
        facebook: 'http://localhost:4000/auth/facebook',
        github: 'http://localhost:4000/auth/github',
        linkedin: 'http://localhost:4000/auth/linkedin',
        twitter: 'http://localhost:4000/auth/twitter',
        instagram: 'http://localhost:4000/auth/instagram',
        reddit: 'http://localhost:4000/auth/reddit'
      }
    });
  }

  res.json({
    message: '✓ You are logged in!',
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      profilePic: req.user.profilePic,
      linkedProviders: req.user.linkedProviders,
      createdAt: req.user.createdAt
    }
  });
});

// ===== LOGOUT =====
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✓ Logged out successfully' });
  });
});

// ===== ERROR =====
app.get('/auth/error', (req, res) => {
  res.status(401).json({ error: '✗ Authentication failed' });
});

// ===== GET ALL USERS =====
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      total: users.length,
      users: users.map(u => ({
        _id: u._id,
        email: u.email,
        name: u.name,
        linkedProviders: u.linkedProviders,
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 OAuth Test Backend Running        ║
╠════════════════════════════════════════╣
║ URL: http://localhost:${PORT}           ║
║ API: http://localhost:${PORT}/          ║
║ Me:  http://localhost:${PORT}/auth/me   ║
╚════════════════════════════════════════╝
  `);
});
