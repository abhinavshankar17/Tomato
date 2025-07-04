const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utilities/catchAsync.js')
const passport = require('passport')
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users')
const user = require('../models/users')
const { isLoggedIn } = require('../middleware/auth');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo , passport.authenticate('local' , {failureFlash: true , failureRedirect: '/login'}) , users.login)


router.get('/myorders', isLoggedIn, (req, res) => {
  res.render('myorders');
});    

router.get('/logout' , users.logout)   


module.exports = router