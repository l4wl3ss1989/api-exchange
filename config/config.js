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
        SECRET: 'S3CR3TP@SSW0RD',
        DATEBASE: 'mongodb+srv://l4wl3ss:awdsqe456ytr@cluster0-lmx78.mongodb.net/exchange?retryWrites=true',
        CLOUDINARY_NAME: 'dvxof9b4f',
        CLOUDINARY_KEY: '192344863923815',
        CLOUDINARY_SECRET: 'KnBx51nuA9xDROuw21Sjm12U8jU',
        PORT: 8080
    }
}

exports.get = function get(env){
    return config[env] || config.default
} 