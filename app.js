const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const User = require('./models/users'); 

mongoose.connect('mongodb://localhost:27017/Tomato')
.then(() => {
    console.log("MongoDB connection established.");
})
.catch(err => {
    console.error("MongoDB connection error:", err);
});


app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', (req , res) => {
    res.render('home');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("User already exists with this email.");
        }

        const newUser = new User({ username, email, phone, password });
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