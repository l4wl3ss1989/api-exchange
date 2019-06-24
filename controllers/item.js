const chalk = require('chalk');
const { validationResult } = require('express-validator/check');

const { uploader } = require('../middleware/cloudinaryConfig');
const { dataUri } = require('../middleware/multer');

const io = require('../socket');
const Item = require('../models/item');
const User = require('../models/user');

exports.getItems = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 12;
    try {
        const totalItems = await Item.find().countDocuments()
        const items = await Item.find()
            .populate('creator')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched items successfully.',
            items,
            totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getItemsUser = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 12;
    const userId = req.params.userId;

    if(userId !== req.userId) {
        const error = new Error('Invalid User.');
        error.statusCode = 401;
        throw error;
    }

    try {
        const totalItems = await Item.find({'creator': userId}).countDocuments()
        const items = await Item.find({'creator': userId})
            .populate('creator','_id  email telf createdAt updatedAt')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched items successfully.',
            items,
            totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getItem = async (req, res, next) => {
    const itemId = req.params.itemId;
    try {
        const item = await Item.findById(itemId)
            .populate('creator', '_id email telf createdAt updatedAt');
        if (!item) {
            const error = new Error('Could not find item.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Item fetched.', item: item });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.createItem = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provaided.');
        error.statusCode = 422;
        throw error;
    }

    try {
        // Save to cloudinary
        const file = dataUri(req).content;
        const uploadedImage = await uploader.upload(file)
        const imageUrl = uploadedImage.url;

        const title = req.body.title;
        const category = req.body.category;
        const content = req.body.content;
        const item = new Item({
            title,
            imageUrl,
            category,
            content,
            creator: req.userId,
        });

        await item.save();
        const user = await User.findById(req.userId);
        user.items.push(item);
        const result = await user.save();
        console.log(chalk.blue('[CREATED ITEM]'), result);
        io.getIO().emit('items', { action: 'create', item: { ...item._doc, creator: { _id: req.userId, name: user.name } } });
        res.status(201).json({
            message: 'Item created successfully!',
            item: item,
            creator: { _id: user._id, name: user.name }
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateItem = async (req, res, next) => {
    const itemId = req.params.itemId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const category = req.body.category;
    const content = req.body.content;
    let imageUrl = req.body.image;
    try {
        if (req.file) {
            // Save to cloudinary
            const file = dataUri(req).content;
            const uploadedImage = await uploader.upload(file)
            imageUrl = uploadedImage.url;
            clearImage(imageUrl);         
        }
        if (!imageUrl) {
            const error = new Error('No file picked.');
            error.statusCode = 422;
            throw error;
        }
        const item = await Item.findById(itemId).populate('creator');
        if (!item) {
            const error = new Error('Could not find item.');
            error.statusCode = 404;
            throw error; //Ends up in cath
        }
        if (item.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        if (imageUrl !== item.imageUrl) {
            clearImage(item.imageUrl);
        }
        item.title = title;
        item.imageUrl = imageUrl;
        item.category = category;
        item.content = content;
        const result = await item.save();
        io.getIO().emit('items', { action: 'update', item: result });
        res.status(200).json({
            message: 'Item updated',
            item: result
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteItem = async (req, res, next) => {
    const itemId = req.params.itemId;
    try {
        const item = await Item.findById(itemId)
        if (!item) {
            const error = new Error('Could not find item.');
            error.statusCode = 404;
            throw error; //Ends up in cath
        }
        if (item.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(item.imageUrl);
        await Item.findByIdAndRemove(itemId);
        const user = await User.findById(req.userId);
        user.items.pull(itemId);
        const result = await user.save();
        io.getIO().emit('items', { action: 'delete', item: itemId });
        console.log(chalk.red('[DELETED item]'), result);
        res.status(200).json({
            message: 'Deleted item.'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
    }
}

const clearImage = async filePath => {
    try {
        let public_id = filePath.split('/');
        public_id = public_id[public_id.length - 1].split('.')[0];
        const destroyImage = await uploader.destroy(public_id);
        console.log(chalk.red('[Deleted Image]'), destroyImage)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

};