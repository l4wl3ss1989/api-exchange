const { config, uploader } = require('cloudinary');
const envConfig = require('../config/config').get(process.env.NODE_ENV);

const cloudinaryConfig = (req, res, next) => {
    config({
        cloud_name: envConfig.CLOUDINARY_NAME,
        api_key: envConfig.CLOUDINARY_KEY,
        api_secret: envConfig.CLOUDINARY_SECRET,
    })

    next();
}

module.exports = { cloudinaryConfig, uploader }