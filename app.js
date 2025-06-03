
// const express = require('express');
// const app = express();
// const path = require('path');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const expressLayouts = require('express-ejs-layouts');
// const User = require('./models/users');
// const flash = require('connect-flash');
// const passport = require('passport');   
// const LocalStrategy = require('passport-local').Strategy;
// const userController = require('./controllers/users');

// mongoose.connect('mongodb://localhost:27017/Tomato')
//     .then(() => {
//         console.log("MongoDB connection established.");
//     })
//     .catch(err => {
//         console.error("MongoDB connection error:", err);
//     });

// // EJS & Middleware
// app.use(expressLayouts);
// app.set('layout', 'layouts/boilerplate'); 
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.urlencoded({ extended: true }));

// // Session
// const sessionConfig = {
//     secret: 'thisshouldbebetterasecret!',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         httpOnly: true,
//         expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// };
// app.use(session(sessionConfig));
// app.use(flash());

// // Passport Config
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// // Flash and locals middleware
// app.use((req, res, next) => {
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// });

// // Routes
// app.get('/', (req, res) => {
//     res.render('home');
// });
// app.get('/home', (req, res) => {
//     res.render('home');
// });

// app.get('/register', (req, res) => {
//     res.render('users/register');
// });

// app.get('/login', (req, res) => {
//     res.render('users/login');
// });

// //  Handle registration submission

// // app.post('/register', async (req, res) => {
// //     try {
// //         const { name, email, password } = req.body;
// //         const user = new User({ name, email });
// //         const registeredUser = await User.register(user, password); //  Secure registration
// //         req.login(registeredUser, err => {
// //             if (err) return next(err);
// //             req.flash('success', 'Welcome to Tomato!');
// //             res.redirect('/main');
// //         });
// //     } catch (err) {
// //         console.error(err);
// //         req.flash('error', err.message);
// //         res.redirect('/register');
// //     }
// // });

// app.post('/register', async (req, res, next) => {
//     try {
//         const { name, email, password } = req.body;

//         // Check if a user with the given email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             req.flash('error', 'A user with that email already exists.');
//             return res.redirect('/register');
//         }

//         const user = new User({ name, email });
//         const registeredUser = await User.register(user, password); // Secure registration

//         req.login(registeredUser, err => {
//             if (err) return next(err);
//             req.flash('success', 'Welcome to Tomato!');
//             res.redirect('/main');
//         });

//     } catch (err) {
//         console.error(err);
//         req.flash('error', err.message);
//         res.redirect('/register');
//     }
// });


// // Handle login submission
// app.post('/login', passport.authenticate('local', {
//     failureFlash: true,
//     failureRedirect: '/login'
// }), (req, res) => {
//     req.flash('success', 'Welcome back!');
//     res.redirect('/main');
// });

// app.get('/main', (req, res) => {
//     res.render('main'); 
// });

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
const User = require('./models/users'); // Passport model
const userController = require('./controllers/users');

// Connect to MongoDB
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

// Session Configuration
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

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for flash messages and current user
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes

app.get('/', (req, res) => res.render('home'));
app.get('/home', (req, res) => res.render('home'));

// Auth Routes
app.get('/register', userController.renderRegister);
app.post('/register', userController.register);

app.get('/login', (req, res) => res.render('users/login'));
app.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/main');
});

// Main page
app.get('/main', (req, res) => res.render('main'));

app.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Logged out successfully!');
        res.redirect('/home');
    });
});


// Start Server
app.listen(8000, () => {
    console.log('Serving on port 8000');
});
