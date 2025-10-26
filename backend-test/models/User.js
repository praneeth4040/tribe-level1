const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  profilePic: String,
  oauthProviders: {
    type: Map,
    of: new mongoose.Schema({
      id: String,
      accessToken: String,
      refreshToken: String
    }, { _id: false }),
    default: {}
  },
  linkedProviders: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
