const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  ingredients: String,
  description: String,
  spiceLevel: String,
  isAvailable: Boolean,
  imageUrl: String
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
