const mongoose = require('mongoose');

const recurringEventSchema = mongoose.Schema({
    cyclePeriod: {
        type: String,
        enum: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS']
    },
    days: [Number],
    endOfCycle: {
        type: Date,
    },
    distance: {
        type: Number
    },
    subtask : { type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('RecurringEvent', recurringEventSchema);