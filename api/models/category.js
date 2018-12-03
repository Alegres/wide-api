const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    color: {
        type: String, 
        required: true
    }
});

// Uniqueness based on the task name and user id
categorySchema.index({name: 1, user: 1}, {unique: true});

categorySchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'category'
});

module.exports = mongoose.model('Category', categorySchema);