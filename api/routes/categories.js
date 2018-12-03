const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const auth = require('../auth/auth');

const Category = require('../models/category');
const User = require('../models/user');


/**
 * @author Damian Cywinski <218396@student.pwr.edu.pl>
 */

/**
 * Get all categories for the user.
 *
 * @name Categories - All categories
 * @route {GET} /categories
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get('/', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    User.findById(id).populate('categories').exec(function(err, userCategories) {
        if (err) return next(err);
        
        res.json(userCategories);
    });

    
});

/**
 * Create new category for the user.
 *
 * @name Categories - New category
 * @route {POST} /categories
 * @bodyparam {String} name is the category name
 * @bodyparam {String} color is a color for the category
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.post('/', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    User.findById(id, (err, user) => {
        if(err) return next(err);
        console.log(req.body.name + " " + req.body.color);

        const newCategory = {
            name: req.body.name,
            color: req.body.color,
            user: id
        };

        Category.create(newCategory, (err) => {
            if(err) { 
                return res.json({success: false, msg: 'Category already exists.'});  
            } else {
                return res.json({success: true, msg: 'Success! Category added!'});
            }
        })
    })
});

/**
 * Get tasks for a specific category.
 *
 * @name Categories - Tasks for category
 * @route {GET} /categories/:id
 * @routeparam {String} :id is the unique identifier for the category.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.get("/:id", auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    // Find tasks for user and category
    User.findById(id)
        .populate({
            path: 'tasks',
            match: { $or: [ { category: req.params.id }, { locality: req.params.id } ] }
        })
        .exec(function(err, tasksForCategory) {
        if (err) return next(err);
        console.log(tasksForCategory);
        res.json(tasksForCategory);
    });
});

/**
 * Update specific category.
 *
 * @name Categories - Update category
 * @route {PUT} /categories/:id
 * @routeparam {String} :id is the unique identifier for the category.
 * @bodyparam {Category} category is a JSON object with data related to the category model. 
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.put('/:id', (req, res, next) => {
    Category.findByIdAndUpdate(req.params.id, req.body, function(err) {
        if(err) { 
            console.log("err");
            return res.json({success: false, msg: 'Category already exists.'});  
        } else {
            console.log("good");
            return res.json({success: true, msg: 'Success! Category added!'});
        }
    });
});

/**
 * Remove specific category.
 *
 * @name Categories - Remove category
 * @route {DELETE} /categories/:id
 * @routeparam {String} :id is the unique identifier for the category.
 * @headerparam {String} JWT token is required to be set inside the header. User id is then extracted from the token.
 * @authentication For this route, authentication is required.
 */
router.delete('/:id', (req, res, next) => {
    Category.findByIdAndDelete(req.params.id, req.body, function(err, post) {
        if(err) return next(err);

        res.json(post);
    });
});

module.exports = router;