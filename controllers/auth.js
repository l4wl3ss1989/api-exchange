const chalk = require('chalk');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config/config').get(process.env.NODE_ENV);
const User = require('../models/user');
const SALT = 12;

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    try {
        const hashedPw = await bcrypt.hash(password, SALT);
        const user = new User({
            email,
            password: hashedPw,
            name
        });
        const result = await user.save();
        console.log(chalk.green(['USER CREATED']), result);
        res.status(201).json({
            message: 'User created!',
            userId: result._id
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            const error = new Error('No user found.');
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, config.SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, userId: user._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
