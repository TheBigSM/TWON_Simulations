const mongoose = require('mongoose');

const Subscription = mongoose.Schema({
  endpoint: String,
  expirationTime: Number,
  keys: {
    p256dh: String,
    auth: String,
  },
});

module.exports = mongoose.model ('subscription', Subscription);