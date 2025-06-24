const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  items: [
  {
    name: String,
    quantity: Number,
    price: Number,
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    }
  }
],
  totalAmount: Number,
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Confirmed',
  },
  isReviewed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Order', orderSchema);
