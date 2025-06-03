const User = require('../models/users');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, name, password } = req.body;

        // Check for duplicate email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'A user with this email already exists.');
            return res.redirect('/register');
        }

        const user = new User({ email, name });

        // Register using passport-local-mongoose
        const registeredUser = await User.register(user, password);

        // Automatically log in the user
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Tomato!');
            res.redirect('/main');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};
