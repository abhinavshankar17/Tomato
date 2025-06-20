
const Owner = require('../models/owners');

module.exports.renderRestaurantRegister = (req, res) => {
    res.render('owners/restregister');
};

module.exports.restaurantRegister = async (req, res, next) => {
    try {
        const {
            ownerName,
            ownerEmail,
            password,
            ownerPhone,
            restaurantName,
            restaurantAddress,
            cuisineType
        } = req.body;

        const existingOwner = await Owner.findOne({ ownerEmail });
        if (existingOwner) {
            req.flash('error', 'An account with this email already exists.');
            return res.redirect('/owners/restregister');
        }

        const newOwner = new Owner({
            ownerName,
            ownerEmail,
            ownerPhone,
            restaurantName,
            restaurantAddress,
            cuisineType
        });

        const registeredOwner = await Owner.register(newOwner, password);

        req.login(registeredOwner, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Tomato, Partner!');
            res.redirect('/owners/dashboard'); 
        });

    } catch (e) {
        if (e.name === 'UserExistsError') {
            req.flash('error', 'Email already registered. Please login.');
        } else {
            req.flash('error', e.message);
        }
        res.redirect('/owners/restregister');
    }
};
