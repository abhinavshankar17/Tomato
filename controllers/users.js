
const User = require('../models/user')

module.exports.register = async (req, res, next) => {
    try {
        const { email, name, password } = req.body;
        const user = new User({ email, name });

        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Tomato!');
            res.redirect('/home');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};