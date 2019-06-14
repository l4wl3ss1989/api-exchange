const config = {
    production: {
        SECRET: process.env.SECRET,
        DATEBASE: process.env.MONGODB_URI,
        CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
        CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
        CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
        PORT: process.env.PORT,

    },
    default: {
        SECRET: '',
        DATEBASE: '',
        CLOUDINARY_NAME: '',
        CLOUDINARY_KEY: '',
        CLOUDINARY_SECRET: '',
        PORT: 8080
    }
}

exports.get = function get(env){
    return config[env] || config.default
} 