const Food = require('../models/food'); // your food model
const { cloudinary } = require('../cloudinary');

module.exports.renderAddFoodForm = (req, res) => {
  res.render('foods/add'); // EJS form
};

module.exports.addFood = async (req, res) => {
  const { name, price, category, ingredients } = req.body;
  const food = new Food({
    name,
    price,
    category,
    ingredients,
    image: {
      url: req.file.path,
      filename: req.file.filename
    }
  });
  await food.save();
  req.flash('success', 'Food item added to menu!');
  res.redirect('/owners/dashboard');
};
