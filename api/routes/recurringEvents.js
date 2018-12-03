const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../auth/auth');

const Task = require('../models/task');
const RecurringEvent = require('../models/recurringEvent');
const User = require('../models/user');

const CalendarService = require('../services/calendarService');

/**
 * @author Damian Cywinski <218396@student.pwr.edu.pl>
 */
/**
 * Get the recurring event for the specific subtask.
 *
 * @name Events - Event for a subtask
 * @route {GET} /events/subtask/:id
 * @routeparam {String} :id is the unique identifier for the subtask.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/subtask/:id', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    SubTask.findById(req.params.id).populate('recurringEvent').exec(function (err, subTask) {
        if (err) {
            console.log(err);
            return next(err);
        }

        res.json(subTask.recurringEvent);
    });
    
  });

/**
 * Get recurring events for the user calendar.
 *
 * @name Events - Events for the user calendar
 * @route {GET} /events/calendar
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/calendar', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    CalendarService.recurringCalendar(id).then(function(resp) {
        console.log("GOT RESP")
        console.log(resp);
        res.json(resp);
    });
});

/**
 * Create new recurring event.
 *
 * @name Events - New recurring event
 * @route {POST} /events
 * @bodyparam {String} cyclePeriod is enum: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS']
 * @bodyparam {Date} endOfCycle is date meaning end of the recurring cycle
 * @bodyparam {Number} distance is a distance between cycle events
 * @bodyparam {String} subtask is id of the specific subtask, for which the event is created
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.post('/', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    let newEvent = {
        cyclePeriod: req.body.cyclePeriod,
        days: req.body.days,
        endOfCycle: req.body.endOfCycle,
        distance: req.body.distance,
        user: id,
        subtask: req.body.subtask
    }


    RecurringEvent.create(newEvent, (err, createdEvent) => {
        if (err)
            return res.json({ success: false, msg: 'Event already exists.' });

        return res.json({ success: true, msg: 'Event created!', createdEventId: createdEvent._id });
    })
});

module.exports = router;