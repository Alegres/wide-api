const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
    title: {
        type: String,
        index: true,
        unique: true
    },
    content: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Entry', entrySchema);