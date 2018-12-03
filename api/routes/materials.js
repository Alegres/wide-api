const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../auth/auth');

const Material = require('../models/material');
const Task = require('../models/task');
const User = require('../models/user');

/**
 * @author Damian Cywinski <218396@student.pwr.edu.pl>
 */

/**
 * Get materials for the specific task.
 *
 * @name Materials - Materials for a task
 * @route {GET} /materials/task/:id
 * @routeparam {String} :id is the unique identifier for the task.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/task/:id', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    Task.findById(req.params.id).populate('materials').exec(function(err, task) {
        if(err) {
            return next(err);
        }

        res.json(task.materials);
    })
    
});

/**
 * Update specific material.
 *
 * @name Materials - Update material
 * @route {PUT} /materials/:id
 * @routeparam {String} :id is the unique identifier for the material.
 * @bodyparam {Material} material is a JSON object with data related to the material model. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.put('/:id', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    Material.findByIdAndUpdate(req.params.id, req.body, function(err) {
        if(err) return next(err);

        res.json({ success: true, msg: "Material updated" });
    })
    
});

/**
 * Create new material for the task.
 *
 * @name Materials - New material
 * @route {POST} /materials
 * @bodyparam {Material} material is a JSON object with data related to the material model. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.post('/', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    Material.create(req.body, (err) => {
        if(err) { 
            return res.json({success: false, msg: 'Material already exists.'});  
        } else {
            return res.json({success: true, msg: 'Success! Material added!'});
        }
    })
});

/**
 * Remove specific material.
 *
 * @name Materials - Remove material
 * @route {DELETE} /materials/:id
 * @routeparam {String} :id is the unique identifier for the material.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.delete('/:id', (req, res, next) => {
    Material.findByIdAndDelete(req.params.id, req.body, function(err, post) {
        if(err) return next(err);

        res.json(post);
    });
});

module.exports = router;