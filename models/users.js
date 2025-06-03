// This file defines the User model using Mongoose and Passport Local Mongoose for authentication.


const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

// This plugin adds username, hash, salt fields and helper methods
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email' // use email instead of default 'username'
});

module.exports = mongoose.model('User', userSchema);
