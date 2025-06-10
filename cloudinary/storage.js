const { cloudinary } = require('./index');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const userId = req.user._id.toString(); // creates a folder per restaurant
    return {
      folder: `Tomato/${userId}`,
      allowed_formats: ['jpeg', 'png', 'jpg'],
      public_id: Date.now().toString() // optional: makes filename unique
    };
  }
});

module.exports = { storage };
