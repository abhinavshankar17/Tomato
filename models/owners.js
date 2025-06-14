const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const ownerSchema = new mongoose.Schema({
  ownerName: String,
  ownerEmail: { type: String, unique: true },
  ownerPhone: String,
  restaurantName: String,
  restaurantPhone: String,
  restaurantAddress: String,
  cuisineType: String,
  isLive: {
  type: Boolean,
  default: false
}
});

// Add username/password (we can use email as username)
ownerSchema.plugin(passportLocalMongoose, { usernameField: 'ownerEmail' });

module.exports = mongoose.model('Owner', ownerSchema);
