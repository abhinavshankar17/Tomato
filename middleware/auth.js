module.exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash('error', 'You must be signed in first!');
    res.redirect('/owners/restlogin');
};

module.exports.isOwnerLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  req.flash('error', 'You must be logged in to do that.');
  res.redirect('/owners/restaurantlogin');
};

module.exports.ensureOwnerAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.restaurantName) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}