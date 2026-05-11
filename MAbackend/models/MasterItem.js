const mongoose = require('mongoose');

const masterItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    details: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

const MasterItem = mongoose.model('MasterItem', masterItemSchema);
module.exports = MasterItem;
