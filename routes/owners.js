
const express = require('express');
const passport = require('passport');
const Owner = require('../models/owners');
const router = express.Router();
const MenuItem = require('../models/menuItem');
const Order = require('../models/order'); 


// Middleware to protect routes
const { isLoggedIn , isOwnerLoggedIn } = require('../middleware/auth');

// =====================
// OWNER REGISTRATION
// =====================

// GET: Registration form
router.get('/restaurantregister', (req, res) => {
  res.render('owners/restregister');
});

// POST: Register new owner
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

    // Check for duplicate email
    const existingOwner = await Owner.findOne({ ownerEmail });
    if (existingOwner) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/owners/restregister');
    }

  
    const newOwner = new Owner({
      username: ownerEmail,
      ownerEmail,
      ownerName,
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

// LIVE: Toggle restaurant status
router.post('/toggle-live', isOwnerLoggedIn, async (req, res) => {
  try {
    const owner = await Owner.findById(req.user._id);
    owner.isLive = req.body.isLive === 'on'; // checkbox sends "on" when checked
    await owner.save();
    req.flash('success', 'Live status updated.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Unable to update live status.');
  }
  res.redirect('/owners/dashboard');
});


// =====================
// LOGIN / LOGOUT
// =====================

// GET: Login form
router.get('/restlogin', (req, res) => {
  res.render('owners/restlogin');
});

// POST: Login
router.post('/restlogin', passport.authenticate('owner-local', {
  failureRedirect: '/owners/restlogin',
  failureFlash: true
}), (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/owners/dashboard');
});

// GET: Logout
router.get('/restaurantlogout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully.');
    res.redirect('/home');
  });
});

// =====================
// DASHBOARD & CRUD
// =====================

// GET: Menu Listing
router.get('/dashboard/menulisting', isLoggedIn, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ owner: req.user._id });
    res.render('owners/dashboard/menulisting', { menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST: Toggle availability
router.post('/menu/toggle/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.redirect('/owners/dashboard/menulisting');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET: Edit form
router.get('/menu/edit/:id', async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  res.render('owners/editFoodItem', { item });
});

// POST: Update food item
router.post('/menu/edit/:id', async (req, res) => {
  const { foodName, category, price, ingredients, description, spiceLevel } = req.body;
  await MenuItem.findByIdAndUpdate(req.params.id, {
    name: foodName,
    category,
    price,
    ingredients,
    description,
    spiceLevel
  });
  req.flash('success', 'Food item updated!');
  res.redirect('/owners/dashboard/menulisting');
});


// router.get('/orders', async (req, res) => {
//   if (!req.isAuthenticated() || !(req.user instanceof Owner)) {
//     req.flash('error', 'Login as an owner to view orders.');
//     return res.redirect('/owners/restlogin');
//   }

//   try {
//     const orders = await Order.find({ restaurant: req.user._id })
//       .populate('customer') // optional, if you want customer info
//       .populate('restaurant'); // optional, if you want restaurant info

//     res.render('owners/orders', { orders });
//   } catch (err) {
//     console.error('Error fetching  orders:', err);
//     req.flash('error', 'Could not fetch orders.');
//     res.redirect('/owners/dashboard');
//   }
// });
router.get('/orders', async (req, res) => {
  if (!req.isAuthenticated() || !(req.user instanceof Owner)) {
    req.flash('error', 'Login as an owner to view orders.');
    return res.redirect('/owners/restlogin');
  }

  try {
    const orders = await Order.find({ restaurant: req.user._id }).sort({ createdAt: -1 });
    const getNextStatus = (currentStatus) => {
      const statusFlow = ['Pending', 'Confirmed', 'Ready to Pick Up', 'Out for Delivery', 'Completed'];
      const index = statusFlow.indexOf(currentStatus);
      return index >= 0 && index < statusFlow.length - 1 ? statusFlow[index + 1] : currentStatus;
    };

    res.render('owners/orders', { orders, getNextStatus });
  } catch (err) {
    console.error('Error fetching orders:', err);
    req.flash('error', 'Could not fetch orders.');
    res.redirect('/owners/dashboard');
  }
});



router.post('/orders/update-status/:id', async (req, res) => {
  if (!req.isAuthenticated() || !(req.user instanceof Owner)) {
    req.flash('error', 'Unauthorized');
    return res.redirect('/owners/restlogin');
  }

  try {
    const order = await Order.findById(req.params.id);
    const statusFlow = ['Pending', 'Confirmed', 'Ready to Pick Up', 'Out for Delivery', 'Completed'];
    const index = statusFlow.indexOf(order.status);


    if (index !== -1 && index < statusFlow.length - 1) {
      order.status = statusFlow[index + 1];
      await order.save();
      
    } else {
      console.log('Status not in flow or already completed');
    }

    return res.redirect('/owners/orders');
  } catch (err) {
    console.error('ERROR updating status:', err);
    req.flash('error', 'Failed to update order status.');
    return res.redirect('/owners/orders');
  }
});


// POST: Delete food item
router.post('/menu/delete/:id', async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  req.flash('success', 'Food item deleted!');
  res.redirect('/owners/dashboard/menulisting');
});

module.exports = router;
