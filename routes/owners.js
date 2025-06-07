// const express = require('express');
// const passport = require('passport');
// const Owner = require('../models/owners');
// const router = express.Router();

// // REGISTER (GET)
// router.get('/restaurantregister', (req, res) => {
//   res.render('owners/register');
// });

// // REGISTER (POST)
// router.post('/restaurantregister', async (req, res, next) => {
//   try {
//     const { ownerName, ownerEmail, ownerPhone, password, restaurantName, restaurantPhone, restaurantAddress, cuisineType } = req.body;
//     const newOwner = new Owner({ ownerName, ownerEmail, ownerPhone, restaurantName, restaurantPhone, restaurantAddress, cuisineType });
//     const registeredOwner = await Owner.register(newOwner, password);
    
//     req.login(registeredOwner, err => {
//       if (err) return next(err);
//       req.flash('success', 'Welcome, Restaurant Owner!');
//       res.redirect('/owners/dashboard'); // you can customize this route
//     });
//   } catch (e) {
//     req.flash('error', e.message);
//     res.redirect('/owners/restaurantregister');
//   }
// });

// // LOGIN (GET)
// router.get('/restaurantlogin', (req, res) => {
//   res.render('owners/login');
// });

// // LOGIN (POST)
// router.post('/restaurantlogin', passport.authenticate('local', {
//   failureRedirect: '/owners/restaurantlogin',
//   failureFlash: true
// }), (req, res) => {
//   req.flash('success', 'Welcome back!');
//   res.redirect('/owners/dashboard'); // customize this
// });

// // LOGOUT
// router.get('/restaurantlogout', (req, res, next) => {
//   req.logout(err => {
//     if (err) return next(err);
//     req.flash('success', 'Logged out successfully.');
//     res.redirect('/home');
//   });
// });

// module.exports = router;

const express = require('express');
const passport = require('passport');
const Owner = require('../models/owners');
const router = express.Router();

// REGISTER (GET)
router.get('/restaurantregister', (req, res) => {
  res.render('owners/restregister');  // ✅ updated from 'register'
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
router.post('/restlogin', passport.authenticate('local', {
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

module.exports = router;
