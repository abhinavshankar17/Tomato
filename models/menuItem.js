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
    default: true // Default value for availability
  },
  imageUrl: String,
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Owner', 
    required: true 
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
