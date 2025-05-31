const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const User = require('./models/users');
const flash = require('connect-flash');


app.use(expressLayouts);
app.set('layout', 'layouts/boilerplate'); 

mongoose.connect('mongodb://localhost:27017/Tomato')
.then(() => {
    console.log("MongoDB connection established.");
})
.catch(err => {
    console.error("MongoDB connection error:", err);
});


app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
    secret: 'thisshouldbebetterasecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req , res , next) =>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


app.get('/', (req , res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('users/register');
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("User already exists with this email.");
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.send("User registered successfully!");
        // Or: res.redirect('/'); to go to home page
    } catch (err) {
        console.error(err);
        res.send("Error registering user.");
    }
});



app.listen(8000 , () =>{
    console.log('Serving on port 8000')
})