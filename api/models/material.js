const mongoose = require('mongoose');
const Action = require('../models/action')

const materialSchema = mongoose.Schema({
    name: {
        type: String,
        index: true,
    },
    content: {
        type: String
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
});

// Uniqueness based on the material name and task id
materialSchema.index({name: 1, task: 1}, {unique: true});

materialSchema.post('save', function(material) {
    let revisionNumber;

    // Get the revision number (count() + 1)
    Action.count({ task : material.task }, function(err, amount) {
        if(err) return next(err);

        revisionNumber = amount;

        Action.create({
            actionType: 'CREATED_MATERIAL',
            task: material.task,
            subTask: null,
            value: material,
            revision: revisionNumber + 1,
            date: new Date()
        }, function(err) {
            if(err) { 
                console.log(err);
            }
        })           
    }) 
})

module.exports = mongoose.model('Material', materialSchema);