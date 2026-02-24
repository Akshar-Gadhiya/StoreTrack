const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['owner', 'manager', 'employee'],
        default: 'employee',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
    },
    permissions: {
        canEditInventory: { type: Boolean, default: false },
        canDeleteItems: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: false },
        canManageTeam: { type: Boolean, default: false },
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
