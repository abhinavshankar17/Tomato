
// const express = require('express');
// const app = express();
// const path = require('path');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const expressLayouts = require('express-ejs-layouts');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const flash = require('connect-flash');
// const User = require('./models/users'); // Passport model
// const userController = require('./controllers/users');
// const Owner = require('./models/owners');
// const ownerRoutes = require('./routes/owners');


// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/Tomato')
//     .then(() => console.log("MongoDB connection established."))
//     .catch(err => console.error("MongoDB connection error:", err));

// // View Engine Setup
// app.use(expressLayouts);
// app.set('layout', 'layouts/boilerplate');
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.urlencoded({ extended: true }));

// // Session Configuration
// const sessionConfig = {
//     secret: 'thisshouldbebetterasecret!',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         httpOnly: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// };
// app.use(session(sessionConfig));
// app.use(flash());

// // Passport Configuration
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// // Middleware for flash messages and current user
// app.use((req, res, next) => {
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// });

// // Routes

// app.get('/', (req, res) => res.render('home'));
// app.get('/home', (req, res) => res.render('home'));

// // Auth Routes
// app.get('/register', userController.renderRegister);
// app.post('/register', userController.register);

// app.get('/login', (req, res) => res.render('users/login'));
// app.post('/login', passport.authenticate('local', {
//     failureFlash: true,
//     failureRedirect: '/login'
// }), (req, res) => {
//     req.flash('success', 'Welcome back!');
//     res.redirect('/main');
// });

// app.get('/restaurant', (req, res) => res.render('restaurant'));
// app.get('/restregister', (req, res) => res.render('owners/restregister'));
// app.get('/restlogin', (req, res) => res.render('owners/restlogin'));
    


// // Main page
// app.get('/main', (req, res) => res.render('main'));

// app.post('/logout', (req, res, next) => {
//     req.logout(err => {
//         if (err) return next(err);
//         req.flash('success', 'Logged out successfully!');
//         res.redirect('/home');
//     });
// });

// // Use separate strategy for owner login

// passport.use('owner-local', new LocalStrategy({ usernameField: 'ownerEmail' }, Owner.authenticate()));
// passport.serializeUser(Owner.serializeUser());
// passport.deserializeUser(Owner.deserializeUser());

// // Mount route
// app.use('/owners', ownerRoutes);


// // Start Server
// app.listen(8000, () => {
//     console.log('Serving on port 8000');
// });

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

const User = require('./models/users');       // User model
const Owner = require('./models/owners');     // Owner model
const userController = require('./controllers/users');
const ownerRoutes = require('./routes/owners');
const ownerController = require('./controllers/owners');

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/Tomato')
    .then(() => console.log("MongoDB connection established."))
    .catch(err => console.error("MongoDB connection error:", err));

// View Engine Setup
app.use(expressLayouts);
app.set('layout', 'layouts/boilerplate');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Session Config
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

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// Local strategy for Users
passport.use('user-local', new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
// Local strategy for Owners
passport.use('owner-local', new LocalStrategy({ usernameField: 'ownerEmail' }, Owner.authenticate()));

// Serialize and deserialize both user types
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

// Flash + Current User middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ------------------ ROUTES ------------------

// Home routes
app.get('/', (req, res) => res.render('home'));
app.get('/home', (req, res) => res.render('home'));

// User Routes
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

// Owner Form Views (direct routes)
app.get('/owners/restregister', ownerController.renderRestaurantRegister);
app.post('/owners/restregister', ownerController.restaurantRegister);
// app.get('/register', userController.renderRegister);
// app.post('/register', userController.register);

app.get('/restlogin', (req, res) => res.render('owners/restlogin'));

// Owner Auth Routes (controllers handled in /routes/owners.js)
app.use('/owners', ownerRoutes);

// Static restaurant info page
app.get('/restaurant', (req, res) => res.render('restaurant'));

// User main dashboard
app.get('/main', (req, res) => res.render('main'));

// Logout route
app.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully!');
        res.redirect('/home');
    });
});

// Start Server
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
