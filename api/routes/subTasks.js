const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../auth/auth');

const SubTask = require('../models/subTask');
const Task = require('../models/task');
const RecurringEvent = require('../models/recurringEvent')
const CalendarService = require('../services/calendarService');

/**
 * @author Damian Cywinski <218396@student.pwr.edu.pl>
 */

/**
 * Get subtasks for the specific task.
 *
 * @name Subtasks - Subtasks for task
 * @route {GET} /subtasks/task/:id
 * @routeparam {String} :id is the unique identifier for the task.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/task/:id', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    Task.findById(req.params.id).populate('subtasks').exec(function (err, subTask) {
        if (err) {
            return next(err);
        }

        res.json(subTask.subtasks);
    });


});

/**
 * Get subtasks for the user calendar.
 *
 * @name Subtasks - Subtasks for the user calendar
 * @route {GET} /subtasks/calendar
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/calendar', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    try {
        CalendarService.subtasksCalendar(id).then(function (resp) {
            console.log(resp);

            res.json(resp);
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});


/**
 * Remove specific subtask.
 *
 * @name Subtasks - Remove subtask
 * @route {DELETE} /subtasks/:id
 * @routeparam {String} :id is the unique identifier for the subtask.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.delete('/:id', auth.required, (req, res, next) => {
    SubTask.findOneAndRemove({ _id: req.params.id }, function (err) {
        if (err) return next(err);

        res.json({ success: true, msg: "Subtask removed correctly!" })
    })
})

/**
 * Get subtask data.
 *
 * @name Subtasks - Get data for subtask
 * @route {GET} /subtasks/:id
 * @routeparam {String} :id is the unique identifier for the subtask.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/:id', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    console.log("Getting subtask details");

    SubTask.findById(req.params.id).populate('task').exec(function (err, subTask) {
        if (err) {
            return next(err);
        }

        res.json(subTask);
    });


});

/**
 * Get recurring event for the subtask.
 *
 * @name Subtasks - Get recurring event
 * @route {GET} /subtasks/:id/recurring
 * @routeparam {String} :id is the unique identifier for the subtask.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/:id/recurring', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    SubTask.findById(req.params.id).populate('recurringEvent').exec(function (err, subTask) {
        if (err) {
            return next(err);
        }

        res.json(subTask.recurringEvent);

    });


});

/**
 * Create new subtask
 *
 * @name Subtasks - New subtask
 * @route {POST} /subtasks
 * @bodyparam {String} name is a name for the subtask. 
 * @bodyparam {String} description is a subtask description. 
 * @bodyparam {Boolean} time is true or false, depending on if the time should be also parsed from the subtask date. 
 * @bodyparam {Date} subTaskDate is a date for the subtask. 
 * @bodyparam {Number} priority is a number, that means the priority of the subtask. 
 * @bodyparam {String} task is task id for which the subtask is created. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.post('/', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    console.log("new task body from client")
    console.log(req.body);

    let newSubTask = {
        name: req.body.name,
        description: req.body.description,
        time: req.body.time,
        date: req.body.subTaskDate,
        priority: req.body.priority,
        recurringEvent: req.body.recurringEvent,
        task: req.body.task,
        user: id
    }

    if (!req.body.withDate) {
        newSubTask.date = null;
        newSubTask.time = false;
    }

    console.log(newSubTask);

    SubTask.create(newSubTask, (err, createdSubTask) => {
        if (err) {
            console.log(err);
            return res.json({ success: false, msg: 'Subtask already exists.' });
        }

        return res.json({ success: true, msg: 'Subtask created!' });
    })
});

/**
 * Move subtask, change priority: previous subtasks for the task will be removed,
 * new and reorganized subtasks will be added
 *
 * @name Subtasks - Move subtask (priority move)
 * @route {POST} /subtasks/move
 * @bodyparam {Array[Task]} Subtasks is an array with new subtasks. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.post('/move', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    SubTask.deleteMany({ task: req.body[0].task }, function (err) {
        if (err) return next(err);

        SubTask.insertMany(req.body, function (err) {
            if (err) return next(err);
        });
    })
});

/**
 * Update specific subtask.
 *
 * @name Subtasks - Update subtask
 * @route {PUT} /subtasks/:id
 * @routeparam {String} :id is the unique identifier for the subtask.
 * @bodyparam {Subtask} subtask is a JSON object with data related to the subtask model. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.put('/:id', (req, res, next) => {
    SubTask.findOneAndUpdate({ _id: req.params.id }, req.body, function (err, subtask) {
        if (err) {
            return next(err);
        } else {
            return res.json({ success: true, msg: 'Success! Subtask updated' });
        }
    });
});

/**
 * Update recurring event reference.
 * Old recurring event will be removed.
 * @name Subtasks - Update recurring event reference
 * @route {PUT} /subtasks/:id/recurring
 * @routeparam {String} :id is the unique identifier for the subtask.
 * @bodyparam {String} recurringEvent is an id of the recurring event to which the subtask should refer to. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.put('/:id/recurring', (req, res, next) => {
    // Delete current recurring event, if the SubTask has one
        SubTask.findById(req.params.id).populate('recurringEvent').exec(function (err, subTask) {
            if (err) {
                return next(err);
            }

            if (subTask.recurringEvent) {
                RecurringEvent.findOneAndRemove({ _id: subTask.recurringEvent._id }, function (err) {
                    if (err) {
                        next(err);
                    } else {
                    }
                });
            }
        })

    SubTask.findByIdAndUpdate(req.params.id, req.body, function (err) {
        if (err) {
            return next(err);
        } else {
            return res.json({ success: true, msg: 'Success! Subtask updated' });
        }
    });
})

module.exports = router;