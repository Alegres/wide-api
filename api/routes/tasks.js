const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../auth/auth');

const Task = require('../models/task');
const User = require('../models/user');
const CalendarService = require('../services/calendarService');
const RecurringEvent = require('../models/recurringEvent');
const SubTask = require('../models/subTask');
const Action = require('../models/action');
const Material = require('../models/material');

/**
 * @author Damian Cywinski <218396@student.pwr.edu.pl>
 */

/**
 * Get tasks for the logged user.
 * Category is virtually populated.
 * @name Tasks - Tasks for user
 * @route {GET} /tasks
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    Task.find({ user: id }).populate('category').exec(function (err, tasks) {
        if (err) return next(err);

        res.json(tasks);
    });
});

/**
 * Get tasks for the user calendar.
 *
 * @name Tasks - Tasks for the user calendar
 * @route {GET} /tasks/calendar
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/calendar', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    try {
        CalendarService.tasksCalendar(id).then(function (resp) {
            console.log(resp);

            res.json(resp);
        });
    } catch (err) {
        console.log(err);
    }
});

/**
 * Create new task
 *
 * @name Tasks - New task
 * @route {POST} /tasks
 * @bodyparam {String} name is a name for the task. 
 * @bodyparam {String} categoryId is an id to the category (can be null). 
 * @bodyparam {String} finalCriterion is a final criterion for the task. 
 * @bodyparam {String} nextStep is a next step for the task. 
 * @bodyparam {Date} date is a date for the task. 
 * @bodyparam {String} priority is enum: ['HIGH', 'MEDIUM', 'LOW', 'NORMAL']. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.post('/', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    let newTask;

    newTask = {
        name: req.body.name,
        category: req.body.categoryId,
        finalCriterion: req.body.finalCriterion,
        nextStep: req.body.nextStep,
        date: req.body.date,
        user: id,
        priority: req.body.priority
    }

    Task.create(newTask, (err, createdTask) => {
        if (err) {
            console.log(err)
            return res.json({ success: false, msg: 'Task already exists.' });
        }

        return res.json({ success: true, msg: 'Task created!', createdTask: createdTask });
    })
});

/**
 * Get task data.
 *
 * @name Tasks - Get data for task
 * @route {GET} /tasks/:id
 * @routeparam {String} :id is the unique identifier for the task.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get("/:id", auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    Task.findById(req.params.id).populate('category').exec(function (err, task) {
        if (err) return next(err);

        res.json(task);
    })
});

/**
 * Update specific task.
 *
 * @name Tasks - Update task
 * @route {PUT} /tasks/:id
 * @routeparam {String} :id is the unique identifier for the task.
 * @bodyparam {Task} task is a JSON object with data related to the task model. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.put('/:id', (req, res, next) => {
    Task.findOneAndUpdate({ _id: req.params.id }, req.body, function (err, task) {
        if (err) return next(err);

        res.json({ success: true, task: task });
    });
});


/**
 * Remove specific task.
 *
 * @name Tasks - Remove task
 * @route {DELETE} /tasks/:id
 * @routeparam {String} :id is the unique identifier for the task.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.delete('/:id', auth.required, (req, res, next) => {
    Task.findOneAndRemove({ _id: req.params.id }, function (err, task) {
        if (err) return next(err);

        res.json({ success: true, msg: "Task removed correctly!" })
    })
})

module.exports = router;