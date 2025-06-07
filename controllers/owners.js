const Owner = require('../models/owners');

module.exports.renderRestaurantRegister = (req, res) => {
    res.render('owners/restregister');
};

module.exports.restaurantRegister = async (req, res, next) => {
    try {
        const {
            ownerName,
            username, // ownerEmail will be received as "username"
            password,
            ownerPhone,
            restaurantName,
            restaurantAddress,
            cuisineType
        } = req.body;

        // Check for duplicate email
        const existingOwner = await Owner.findOne({ ownerEmail: username });
        if (existingOwner) {
            req.flash('error', 'An account with this email already exists.');
            return res.redirect('/owners/restregister');
        }

        const newOwner = new Owner({
            ownerName,
            ownerEmail: username,
            ownerPhone,
            restaurantName,
            restaurantAddress,
            cuisineType
        });

        const registeredOwner = await Owner.register(newOwner, password);

        req.login(registeredOwner, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Tomato, Partner!');
            res.redirect('/owners/dashboard'); // adjust as per your app's flow
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/owners/restregister');
        console.log(e); // Log the error for debugging
    }
};
