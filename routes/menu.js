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

console.log('menu.js loaded successfully');

module.exports = router;
