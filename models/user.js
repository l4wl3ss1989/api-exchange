const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    //future add option telephone ?
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    telf: {
        type: String,
        required: false
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
