const { cloudinary } = require('./index');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const restaurantId = req.user._id.toString();
    return {
      folder: `Tomato/${restaurantId}`,
      allowed_formats: ['jpeg', 'png', 'jpg']
    };
  }
});

module.exports = { storage };
