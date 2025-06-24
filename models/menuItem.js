const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  ingredients: String,
  description: String,
  spiceLevel: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  imageUrl: String,
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Owner', 
    required: true 
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  totalRating: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
