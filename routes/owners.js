// This file handles the routes for restaurant owners, including registration, login, and dashboard functionalities.

const express = require('express');
const passport = require('passport');
const Owner = require('../models/owners');
const router = express.Router();
const MenuItem = require('../models/menuItem'); // Assuming you have a MenuItem model for managing menu items

// Middleware for checking if the user is logged in
const { isLoggedIn } = require('../middleware/auth');



// REGISTER (GET)
router.get('/restaurantregister', (req, res) => {
  res.render('owners/restregister'); 
});

// REGISTER (POST)
router.post('/restregister', async (req, res, next) => {
  try {
    const {
      ownerName,
      ownerEmail,
      ownerPhone,
      password,
      restaurantName,
      restaurantPhone,
      restaurantAddress,
      cuisineType
    } = req.body;

    // 🔒 Check for duplicate email
    const existingOwner = await Owner.findOne({ ownerEmail });
    if (existingOwner) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/owners/restregister');
    }

    const newOwner = new Owner({
      ownerName,
      ownerEmail,
      ownerPhone,
      restaurantName,
      restaurantPhone,
      restaurantAddress,
      cuisineType
    });

    const registeredOwner = await Owner.register(newOwner, password);

    req.login(registeredOwner, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome, Restaurant Owner!');
      res.redirect('/owners/dashboard');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/owners/restregister');
  }
});

// LOGIN (GET)
router.get('/restlogin', (req, res) => {
  res.render('owners/restlogin'); 
});

// LOGIN (POST)
router.post('/restlogin', passport.authenticate('owner-local', {
  failureRedirect: '/owners/restlogin',
  failureFlash: true
}), (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/owners/dashboard');
});

// LOGOUT
router.get('/restaurantlogout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully.');
    res.redirect('/home');
  });
});

// router.get('/dashboard/menulisting', async (req, res) => {
//   try {
//     const menuItems = await MenuItem.find({ owner: req.user._id });
//     res.render('owners/dashboard/menulisting', { menuItems });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

router.get('/dashboard/menulisting', isLoggedIn, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ owner: req.user._id });
    res.render('owners/dashboard/menulisting', { menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
