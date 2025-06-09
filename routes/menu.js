const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});
const upload = multer({ storage });

// Controller or inline logic
const MenuItem = require('../models/menuItem'); // Create a Mongoose model for menu items

router.post('/add', upload.single('foodImage'), async (req, res) => {
  const { foodName, category, price, ingredients, description, spiceLevel, isAvailable } = req.body;
  const foodImage = req.file ? `/uploads/${req.file.filename}` : null;

  const newItem = new MenuItem({
    name: foodName,
    category,
    price,
    ingredients,
    description,
    spiceLevel,
    isAvailable: isAvailable === 'true',
    imageUrl: foodImage
  });

  await newItem.save();
  req.flash('success', 'Food item added to menu!');
  res.redirect('/owners/dashboard'); // or redirect to a menu list page
});

module.exports = router;
