const mongoose = require('mongoose');

const actionSchema = mongoose.Schema({
    actionType: {
        type: String,
        enum: ['CREATED', 'DELETED', 'COMPLETED', 'MODIFIED', 'CREATED_SUBTASK']
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    subTask: { type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' },
    value: {
        type: mongoose.Schema.Types.Mixed
    },
    revision: {
        type: Number
    },
    date: {
        type: Date,
    }

});

module.exports = mongoose.model('Action', actionSchema);