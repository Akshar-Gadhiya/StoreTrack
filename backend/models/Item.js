const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: String,
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    lowStockThreshold: {
        type: Number,
        default: 5,
    },
    price: {
        type: Number,
        required: true,
    },
    supplier: String,
    expiryDate: Date,
    itemCode: {
        type: String,
        required: true,
        unique: true,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    location: {
        section: String,
        rack: String,
        shelf: String,
        bin: String,
    },
    images: [String],
    qrCode: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active',
    },
}, {
    timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
