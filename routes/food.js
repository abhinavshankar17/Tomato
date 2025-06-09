const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const foodController = require('../controllers/foodController');

router.get('/add', foodController.renderAddFoodForm);
router.post('/add', upload.single('image'), foodController.addFood);

module.exports = router;
