const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/item');
const isAuth = require('../middleware/is-auth');
const { multerUploads } = require('../middleware/multer');

const router = express.Router();

// GET /feed/items
router.get('/items', feedController.getItems);

router.get('/items/:userId', isAuth, feedController.getItemsUser);

// POST /feed/item
router.post('/item', isAuth, multerUploads, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], feedController.createItem);

router.get('/item/:itemId', isAuth, feedController.getItem);

router.put('/item/:itemId', isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], feedController.updateItem);

router.delete('/item/:itemId', isAuth, feedController.deleteItem);

module.exports = router;