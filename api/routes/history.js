const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../auth/auth');

const Task = require('../models/task');

/**
 * Get all actions for the task.
 *
 * @name History - All actions
 * @route {GET} /history
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/task/:id', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    Task.findById(req.params.id).where({ user: id }).populate('actions').exec(function(err, taskActions) {
        if(err) return next(err);

        res.json(taskActions.actions);
    })
    
});

module.exports = router;