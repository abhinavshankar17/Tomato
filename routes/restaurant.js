
const Restaurant = require('./models/restaurant'); // adjust path
const MenuItem = require('./models/menuitem');     // adjust path

app.get('/restaurant/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    const menuItems = await MenuItem.find({ restaurant: restaurant._id });
    res.render('restaurantDetails', { restaurant, menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
});
