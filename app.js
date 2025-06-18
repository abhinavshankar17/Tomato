// Description: Main application file for the Tomato restaurant management system.


require('dotenv').config();


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

const User = require('./models/users');
const Owner = require('./models/owners');
const userController = require('./controllers/users');
const ownerController = require('./controllers/owners');
const ownerRoutes = require('./routes/owners');
const menuRoutes = require('./routes/menu');
const Restaurant = require('./models/owners'); 
const MenuItem = require('./models/menuItem'); 
const Order = require('./models/order'); // Import Order model

// ------------------ MONGOOSE SETUP ------------------
mongoose.connect('mongodb://localhost:27017/Tomato')
    .then(() => console.log("MongoDB connection established."))
    .catch(err => console.error("MongoDB connection error:", err));

// ------------------ MIDDLEWARE ------------------
// Static files and parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine
app.use(expressLayouts);
app.set('layout', 'layouts/boilerplate');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware (must be before passport)
const sessionConfig = {
    secret: 'thisshouldbebetterasecret!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategies
passport.use('user-local', new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.use('owner-local', new LocalStrategy(Owner.authenticate()));

// Serialize/deserialize
passport.serializeUser((user, done) => {
    done(null, { id: user.id, type: user instanceof User ? 'User' : 'Owner' });
});

passport.deserializeUser(async (obj, done) => {
    try {
        if (obj.type === 'User') {
            const user = await User.findById(obj.id);
            return done(null, user);
        } else if (obj.type === 'Owner') {
            const owner = await Owner.findById(obj.id);
            return done(null, owner);
        }
    } catch (err) {
        return done(err);
    }
});

// Flash messages and current user setup
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ------------------ ROUTES ------------------
// Menu and Owner routes
app.use('/menu', menuRoutes);
app.use('/owners', ownerRoutes);

// Home
app.get('/', (req, res) => res.render('home'));
app.get('/home', (req, res) => res.render('home'));

// User Registration/Login
app.get('/register', userController.renderRegister);
app.post('/register', userController.register);

app.get('/login', (req, res) => res.render('users/login'));
app.post('/login', passport.authenticate('user-local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/main');
});

// Owner Registration/Login
app.get('/owners/restregister', ownerController.renderRestaurantRegister);
app.post('/owners/restregister', ownerController.restaurantRegister);

app.get('/owners/restlogin', (req, res) => res.render('owners/restlogin'));
app.post('/owners/restlogin', passport.authenticate('owner-local', {
    failureFlash: true,
    failureRedirect: '/owners/restlogin'
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/owners/dashboard');
});

// Owner Dashboard (protected route)
app.get('/owners/dashboard', (req, res) => {
    if (!req.isAuthenticated() || !(req.user instanceof Owner)) {
        req.flash('error', 'You must be logged in as a restaurant owner to access this page.');
        return res.redirect('/owners/restlogin');
    }
    res.render('owners/dashboard', { owner: req.user });
});

// User Dashboard
// app.get('/main', (req, res) => res.render('main'));

// Static Restaurant Page
app.get('/restaurant', (req, res) => res.render('restaurant'));

// Menu Page (direct access)
app.get('/menu', (req, res) => res.render('owners/menu'));



app.get('/main', async (req, res) => {
  try {
    const onlineRestaurants = await Owner.find({ isLive: true });

    // Attach one menu item (with image) for each restaurant
    const restaurantsWithImages = await Promise.all(
      onlineRestaurants.map(async (owner) => {
        const item = await MenuItem.findOne({
          owner: owner._id,
          imageUrl: { $exists: true, $ne: '' },
        });

        return {
          ...owner.toObject(),
          menuImage: item?.imageUrl || null, // Add image if exists
        };
      })
    );

    res.render('main', {
      currentUser: req.user,
      onlineRestaurants: restaurantsWithImages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading home page");
  }
});

app.get('/restaurant/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    const menuItems = await MenuItem.find({ owner: restaurant._id });

    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }

    res.render('restaurantDetails', { restaurant, menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});


//the below code might be helpful in future

// app.get('/checkout', async (req, res) => {
//   const cart = req.session.cart || [];
//   const summary = [];

//   for (const cartItem of cart) {
//     const item = await MenuItem.findById(cartItem.itemId);
//     if (item) {
//       summary.push({
//         name: item.name,
//         quantity: cartItem.quantity,
//         total: cartItem.quantity * item.price,
//         imageUrl: item.imageUrl 
//       });
//     }
//   }

//   const totalAmount = summary.reduce((acc, curr) => acc + curr.total, 0);
//   console.log('Checkout Summary:', summary);

//   res.render('checkout', { summary, totalAmount });
// });

app.post('/checkout', async (req, res) => {
  try {
    // OPTIONAL: If you want to start fresh when coming from a new restaurant
    const restaurantId = req.body.restaurantId;
    if (restaurantId && req.session.cart && req.session.cart.length > 0) {
      const existingOwner = req.session.cart[0]?.owner?.toString();
      if (existingOwner && existingOwner !== restaurantId) {
        req.session.cart = []; // Clear if restaurant changed
      }
    }

    const summary = req.session.cart || [];

    // if (summary.length === 0) {
    //   req.flash('error', 'Cart is empty.');
    //   return res.redirect(`/restaurant/<% owner._id %>`);

    // }
    if (summary.length === 0) {
  req.flash('error', 'Cart is empty.');
  return res.redirect(`/restaurant/${firstItem.owner}`);
}


    const totalAmount = summary.reduce((acc, item) => acc + item.total, 0);
    const firstItem = summary[0];

    if (!firstItem || !firstItem.owner) {
      req.flash('error', 'Restaurant info missing from cart');
      return res.redirect('/main');
    }

    const restaurant = await Owner.findById(firstItem.owner);

    if (!restaurant) {
      req.flash('error', 'Invalid restaurant.');
      return res.redirect('/main');
    }

    res.render('checkout', { summary, totalAmount, restaurant });
  } catch (err) {
    console.error('Checkout error:', err);
    req.flash('error', 'Could not load checkout page.');
    res.redirect('/main');
  }
});



// Confirm Order route

app.post('/order/confirm', async (req, res) => {
  try {
    const summary = JSON.parse(req.body.orderSummary);
    const totalAmount = req.body.totalAmount;
    const restaurantId = req.body.restaurantId;
    const customerId = req.user._id;

    if (!restaurantId || !summary || summary.length === 0) {
      req.flash('error', 'Invalid order data');
      return res.redirect('/main');
    }

    const newOrder = new Order({
      restaurant: restaurantId,
      items: summary.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.total
      })),
      totalAmount,
      customer: customerId
    });

    await newOrder.save();

    // Clear the cart after order is confirmed
    req.session.cart = [];

    res.send(`
      <html>
        <head><meta http-equiv="refresh" content="2;url=/main" /></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f8f9fa;font-family:sans-serif;">
          <div class="message" style="font-size:1.5rem;color:#28a745;">✅ Order Confirmed! Redirecting...</div>
        </body>
      </html>
    `);

  } catch (err) {
    console.error("Error confirming order:", err);
    res.status(500).send('Failed to confirm order');
  }
});







// Logout
app.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully!');
        res.redirect('/home');
    });
});

// ------------------ SERVER ------------------
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

