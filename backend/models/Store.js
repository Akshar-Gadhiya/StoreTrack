const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    sections: [{
        id: String,
        name: String,
        racks: [{
            id: String,
            name: String,
            shelves: [{
                id: String,
                name: String,
                bins: [String]
            }]
        }]
    }]
}, {
    timestamps: true,
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
