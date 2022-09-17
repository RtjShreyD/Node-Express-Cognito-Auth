const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    isRegister: {
        type: Boolean,
        default: false,
    },
    hasPaid: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", userSchema);