const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Entry = require('../models/entry');

router.get('/', (req, res, next) => {
    Entry.find(function(err, entries) {
        if(err) return next(err);
        res.json(entries);
    });
});

router.post('/', (req, res, next) => {
    Entry.create(req.body, function(err, post) {
        if(err) return next(err);
        res.json(post);
    })
});

router.get("/:entryId", (req, res, next) => {
    const id = req.params.entryId;
    console.log(id);

    Entry.findById(id, function(err, entry) {
        if(err) return next(err);
    
        res.json({
            entry: entry
        });
    });
});

router.put('/:id', (req, res, next) => {
    Entry.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
        if(err) return next(err);

        res.json(post);
    });
});

router.delete('/:id', (req, res, next) => {
    Entry.findByIdAndDelete(req.params.id, req.body, function(err, post) {
        if(err) return next(err);

        res.json(post);
    });
});

module.exports = router;