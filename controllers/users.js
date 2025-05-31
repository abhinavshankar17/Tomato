const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
        res.render('users/register')
    }


module.exports.register = 
    async (req , res , next) => {
        try{
        const {email , username , password} = req.body
        const user = new User({email , username})
         const registeredUser = await User.register(user,password)
         req.login(registeredUser , err => {
            if(err) return next(err)
         req.flash('success' ,'Welcome to Tomato')
         res.redirect('/home')
         })
         
        }catch(e){
            req.flash('error' , e.message)
            return res.redirect('/register')
        }
    }      