const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary/storage');
const upload = multer({ storage });

const MenuItem = require('../models/menuItem');
const { isLoggedIn } = require('../middleware/auth');

router.post('/add', isLoggedIn, upload.single('foodImage'), async (req, res) => {
  try {
    const { foodName, category, price, ingredients, description, spiceLevel, isAvailable } = req.body;
    const imageUrl = req.file?.path;

    const newItem = new MenuItem({
      name: foodName,
      category,
      price,
      ingredients,
      description,
      spiceLevel,
      isAvailable: isAvailable === 'true',
      imageUrl,
      owner: req.user._id
    });

    await newItem.save();
    req.flash('success', 'Food item added!');
    res.redirect('/owners/dashboard/menulisting');
  } catch (err) {
    console.error('Error adding food item:', err);
    res.status(500).send('Server Error');
  }
});

router.post('/toggle-availability/:id', isLoggedIn, async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).send('Item not found');
    
    item.isAvailable = !item.isAvailable;
    await item.save();
    
    res.redirect('/owners/dashboard/menulisting');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Route to add item to session cart
router.post('/add-to-cart/:id', async (req, res) => {
  const itemId = req.params.id;
  const quantity = parseInt(req.body.quantity) || 1;

  try {
    const menuItem = await MenuItem.findById(itemId).populate('owner');

    if (!menuItem) {
      req.flash('error', 'Item not found.');
      return res.redirect('/main');
    }

    req.session.cart = req.session.cart || [];

    // Check if all items are from same restaurant
    if (
      req.session.cart.length > 0 &&
      req.session.cart[0].owner.toString() !== menuItem.owner._id.toString()
    ) {
      req.flash('error', 'You can only order from one restaurant at a time.');
      return res.redirect('/main');
    }

    // Push item to cart
    req.session.cart.push({
      itemId: menuItem._id,
      name: menuItem.name,
      quantity,
      price: menuItem.price,
      total: menuItem.price * quantity,
      imageUrl: menuItem.imageUrl,
      owner: menuItem.owner._id
    });

    req.flash('success', 'Item added to cart!');
    res.redirect('/main');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/main');
  }
});


console.log('menu.js loaded successfully');

module.exports = router;
