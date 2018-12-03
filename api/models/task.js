const mongoose = require('mongoose');
const SubTask = require('../models/subTask');
const Material = require('../models/material');
const Action = require('../models/action')

const taskSchema = mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    finalCriterion: {
        type: String,
        required: true
    },
    nextStep: {
        type: String,
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['HIGH', 'MEDIUM', 'LOW', 'NORMAL']
    },
    state: {
        type: String,
        enum: ['OPEN', 'DONE', 'PAUSED'],
        default: 'OPEN'
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Uniqueness based on the task name and user id
taskSchema.index({ name: 1, user: 1 }, { unique: true });

taskSchema.virtual('subtasks', {
    ref: 'SubTask',
    localField: '_id',
    foreignField: 'task'
});

taskSchema.virtual('materials', {
    ref: 'Material',
    localField: '_id',
    foreignField: 'task'
});

taskSchema.virtual('actions', {
    ref: 'Action',
    localField: '_id',
    foreignField: 'task'
});

taskSchema.pre('findOneAndRemove', function () {
    let task = {};
    task._id = this._conditions._id;

    // Remove connected data
    Material.remove({ task: task._id }, function (err) {
        if (err) {
            console.log(err)
            return next(err);
        }
    });
    Action.remove({ task: task._id }, function (err) {
        console.log(err)
        if (err) return next(err);
    });
    SubTask.remove({ task: task._id }, function (err) {
        console.log(err)
        if (err) return next(err);
    });
})

taskSchema.post('save', function (task) {
    let revisionNumber;

    // Get the revision number (count() + 1)
    Action.count({ task: task._id }, function (err, amount) {
        if (err) return next(err);

        revisionNumber = amount;

        Action.create({
            actionType: 'CREATED',
            task: task._id,
            subTask: null,
            value: task,
            revision: revisionNumber + 1,
            date: new Date()
        }, function (err) {
            if (err) {
                console.log(err);
            }
        })
    })
})

taskSchema.post('findOneAndUpdate', function (result) {
    let update = this._update;

    // Get the revision number (count() + 1)
    Action.count({ task: update._id }, function (err, amount) {
        if (err) return next(err);

        revisionNumber = amount;

        Action.create({
            actionType: 'MODIFIED',
            task: update._id,
            subTask: null,
            value: update,
            revision: revisionNumber + 1,
            date: new Date()
        }, function (err) {
            if (err) {
                console.log(err);
            }
        })
    })
});

module.exports = mongoose.model('Task', taskSchema);