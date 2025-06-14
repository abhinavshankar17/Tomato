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

// ------------------ MONGOOSE SETUP ------------------
mongoose.connect('mongodb://localhost:27017/Tomato')
    .then(() => console.log("MongoDB connection established."))
    .catch(err => console.error("MongoDB connection error:", err));

// ------------------ MIDDLEWARE ------------------
// Static files and parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

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

// Main Page (for users to see online restaurants)
app.get('/main', async (req, res) => {
  try {
    const onlineRestaurants = await Owner.find({ isLive: true });

    res.render('main', {
      currentUser: req.user,
      onlineRestaurants
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

