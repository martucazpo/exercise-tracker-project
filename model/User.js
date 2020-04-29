const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    userId: {
        type: String,
        required: true,
        default: shortid.generate()
    },
    exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);