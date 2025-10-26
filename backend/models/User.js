const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
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
      trim: true,
    },
    profilePic: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    // OAuth provider IDs
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
      instagram: {
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
      reddit: {
        id: String,
        accessToken: String,
      },
      github: {
        id: String,
        accessToken: String,
      },
    },
    // Track which providers are linked
    linkedProviders: [
      {
        type: String,
        enum: ['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'reddit', 'github'],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
