const mongoose = require('mongoose');
const Action = require('../models/action')
const RecurringEvent = require('../models/recurringEvent')
const SubTask = require('../models/subTask')

const subTaskSchema = mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    date: {
        type: Date
    },
    priority: {
        type: Number
    },
    description: {
        type: String
    },
    recurringEvent: {
        type: mongoose.Schema.Types.ObjectId, ref: 'RecurringEvent',
    },
    time: {
        type: Boolean
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
});

// Uniqueness based on the subtask name, task and user id
subTaskSchema.index({ name: 1, user: 1, task: 1 }, { unique: true });

subTaskSchema.post('findOneAndUpdate', function (result) {
    let update = this._update;

    // Get the revision number (count() + 1)
    Action.count({ task: update.task }, function (err, amount) {
        if (err) return next(err);

        revisionNumber = amount;

        Action.create({
            actionType: 'MODIFIED',
            task: update.task,
            subTask: update._id,
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

subTaskSchema.pre('findOneAndRemove', function () {
    let subtask = {};
    subtask._id = this._conditions._id;

    // Remove connected data
    RecurringEvent.remove({ subtask: subtask._id }, function (err) {
        if (err) {
            console.log(err)
            return next(err);
        }
    });
    /*
        SubTask.findById(subtask._id).populate('task').exec(function (err, sub) {
            if(err) {
                console.log(err)
                return(err);
            }
    
            console.log("NO ERR")
            task = sub.task;
            console.log(task);
    
            // Get the revision number (count() + 1)
            Action.count({ task: task._id }, function (err, amount) {
                if (err) return next(err);
    
                revisionNumber = amount;
    
                Action.create({
                    actionType: 'DELETED',
                    task: task._id,
                    subTask: subtask._id,
                    value: null,
                    revision: revisionNumber + 1,
                    date: new Date()
                }, function (err) {
                    if (err) {
                        console.log(err);
                    }
    
    
                })
            })
        })
        \*/
})

subTaskSchema.pre('remove', function () {
    console.log("REMOVINGGG")
    console.log(this);

    // Remove connected data
    RecurringEvent.remove({ subtask: subtask._id }, function (err) {
        if (err) {
            console.log(err)
            return next(err);
        }
    });
})

subTaskSchema.post('save', function (subtask) {
    let revisionNumber;

    // Get the revision number (count() + 1)
    Action.count({ task: subtask.task }, function (err, amount) {
        if (err) return next(err);

        revisionNumber = amount;

        Action.create({
            actionType: 'CREATED_SUBTASK',
            task: subtask.task,
            subTask: subtask._id,
            value: subtask,
            revision: revisionNumber + 1,
            date: new Date()
        }, function (err) {
            if (err) {
                console.log(err);
            }
        })
    })
})

module.exports = mongoose.model('SubTask', subTaskSchema);