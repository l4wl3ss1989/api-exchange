const path =  require('path');

const multer = require('multer');
const Datauri = require('datauri');

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image');
const dUri = new Datauri();
const dataUri = (req) => {
    return dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
}

module.exports = { multerUploads, dataUri };