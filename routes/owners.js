const express = require('express');
const passport = require('passport');
const Owner = require('../models/owners');
const router = express.Router();

// REGISTER (GET)
router.get('/restaurantregister', (req, res) => {
  res.render('owners/register');
});

// REGISTER (POST)
router.post('/restaurantregister', async (req, res, next) => {
  try {
    const { ownerName, ownerEmail, ownerPhone, password, restaurantName, restaurantPhone, restaurantAddress, cuisineType } = req.body;
    const newOwner = new Owner({ ownerName, ownerEmail, ownerPhone, restaurantName, restaurantPhone, restaurantAddress, cuisineType });
    const registeredOwner = await Owner.register(newOwner, password);
    
    req.login(registeredOwner, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome, Restaurant Owner!');
      res.redirect('/owners/dashboard'); // you can customize this route
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/owners/restaurantregister');
  }
});

// LOGIN (GET)
router.get('/restaurantlogin', (req, res) => {
  res.render('owners/login');
});

// LOGIN (POST)
router.post('/restaurantlogin', passport.authenticate('local', {
  failureRedirect: '/owners/restaurantlogin',
  failureFlash: true
}), (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/owners/dashboard'); // customize this
});

// LOGOUT
router.get('/restaurantlogout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully.');
    res.redirect('/home');
  });
});

module.exports = router;
