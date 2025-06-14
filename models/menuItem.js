
const mongoose = require('mongoose');
const { type } = require('os');

const menuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  ingredients: String,
  description: String,
  spiceLevel: String,
  isAvailable: {
    type: Boolean,
    default: true // Default value for isAvailable
  },
  imageUrl: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // ✅ required
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
