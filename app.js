const path = require('path');

const chalk = require('chalk');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { uploader, cloudinaryConfig } = require('./middleware/cloudinaryConfig');
const { multerUploads, dataUri } = require('./middleware/multer');
const config = require('./config/config').get(process.env.NODE_ENV);

const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');

const app = express();

app.use(bodyParser.json()); //application/json
// app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use('*', cloudinaryConfig);

// Converting to 'public' api
app.use('/images', express.static(path.resolve('images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // insted of * we could limit that to client urls
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/post', postRoutes);
app.use('/auth', authRoutes);

// Error handling
app.use((error, req, res, next) => {
    console.log(chalk.red('[ERROR]'), error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data
    res.status(status).json({ message, data });
});

// Mongoose/app connection
mongoose.connect(config.DATEBASE, { useNewUrlParser: true })
    .then(result => {
        const server = app.listen(config.PORT, () => console.log(`Listening on port: ${chalk.blue(config.PORT)}`));
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log(`[Client] ${chalk.green('connected')}`);
        });
    })
    .catch(err => console.log(err));