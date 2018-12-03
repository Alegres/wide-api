// Prepare tasks for calendar
const Task = require('../models/task');
const User = require('../models/user');
const Sub = require('../models/subTask');
const moment = require('moment');

exports.tasksCalendar = function (userId) {
    let tempEvents = [];

    return new Promise(function (resolve, reject) {
        // Find tasks
        Task.find({})
            .where('user').equals(userId)
            .where('state').equals('OPEN')
            .populate('category').exec(function (err, tasksCat, next) {


                if (err) reject(err);

                for (task of tasksCat) {
                    let color;

                    if (task.category)
                        color = task.category.color
                    else
                        color = "lightBlue"

                    var event;
                    event = {
                        title: task.name,
                        id: task._id,
                        start: task.date,
                        allDay: true,
                        backgroundColor: color,
                        task: task
                    }

                    tempEvents.push(event);
                }

                resolve(tempEvents);
            })
    })
}

exports.subtasksCalendar = function (userId) {
    let tempEvents = [];

    return new Promise(function (resolve, reject) {
        // Find subtasks
        Task.find({})
            .where('user').equals(userId)
            .where('state').equals('OPEN')
            .populate('category')
            .populate('subtasks').exec(function (err, tasks) {
                if (err) {
                    console.log(err);
                    reject(err);
                }

                for (task of tasks) {
                    if (task.subtasks) {
                        let tempSubs = task.subtasks;

                        // Push all event-type subtasks to the array
                        for (subtask of tempSubs) {
                            if (subtask.date) {
                                let event;
                                let color;
                                let allDay = true;

                                if (subtask.time)
                                    allDay = false;

                                if (task.category)
                                    color = task.category.color
                                else
                                    color = "lightBlue"

                                event = {
                                    title: subtask.name + ":" + task.name,
                                    id: task._id,
                                    start: subtask.date,
                                    allDay: allDay,
                                    backgroundColor: color,
                                    task: task,
                                    subtask: subtask
                                }

                                tempEvents.push(event);
                            }
                        }
                    }
                }

                resolve(tempEvents);
            })
    })
}

exports.recurringCalendar = function (userId) {
    let tempEvents = [];
    return new Promise(function (resolve, reject) {
        // Find all recurring events for user
        User.find({ _id: userId }).populate({
            path: 'recurringEvents',
            populate: {
                path: 'subtask',
                populate: {
                    path: 'task',
                    populate: { path: 'category' }
                }
            }
        }).exec(function (err, user) {
            if (err) reject(err);

            console.log("USERRR")
            console.log(user);

            // Iterate through each event
            for (recurringEvent of user[0].recurringEvents) {
                console.log("RECURARE")
                console.log(recurringEvent);
                if (recurringEvent.subtask) {
                    let subtask = recurringEvent.subtask;
                    let task = recurringEvent.subtask.task;

                    if (task) {
                        // Check if task is in OPEN state
                        if (task.state == 'OPEN') {

                            let color;
                            let allDay = true;
                            
                            // If no time set, this is the all day event
                            if (subtask.time) {
                                allDay = false;
                            }

                            // If no category defined, set default color
                            if (task.category)
                                color = task.category.color
                            else
                                color = "lightBlue"

                            // Cast dates to moment dates
                            let currentDate = moment(subtask.date);
                            let untilDate = moment(recurringEvent.endOfCycle)

                            // Render duplicated events for WEEKS option
                            if (recurringEvent.cyclePeriod == 'WEEKS') {
                                var eventTemp = [];

                                // Check if the end of the cycle date was reached
                                while (currentDate.isSameOrBefore(untilDate)) {

                                    // Check if specific week days were choosen
                                    if (recurringEvent.days.length > 0) {
                                        let tempDate = moment(new Date(currentDate.toDate()));
    
                                        
                                        // Iterate through days array and create respective tasks
                                        for (let day of recurringEvent.days) {
                                            var event = {
                                                title: subtask.name + ":" + task.name,
                                                start: null,
                                                allDay: allDay,
                                                backgroundColor: color,
                                                task: task,
                                                subtask: subtask
                                            }

                                            let anotherTempDate = moment(new Date(tempDate.toDate()));

                                            const today = anotherTempDate.isoWeekday();

                                            // Set new date for the next choosen week day
                                            if (today <= day) {
                                                anotherTempDate = anotherTempDate.isoWeekday(day)
                                                console.log("BABAJ")
                                            }
                                            else {
                                                console.log("DADAJ")
                                                anotherTempDate = anotherTempDate.add(1, 'weeks').isoWeekday(day);
                                            }

                                            // Check once again, if the end of the cycle date was reached
                                            if (anotherTempDate.isSameOrBefore(untilDate)) {
                                                event.start = anotherTempDate.toDate();
                                                tempEvents.push(event);
                                            }
                                        }

                                        // Move to the further dates
                                        currentDate = currentDate.add(recurringEvent.distance, 'week');
                                    } else {
                                        var event = {
                                            title: subtask.name + ":" + task.name,
                                            start: null,
                                            allDay: allDay,
                                            backgroundColor: color,
                                            task: task,
                                            subtask: subtask
                                        }

                                        currentDate = currentDate.add(recurringEvent.distance, 'week');


                                        if (currentDate.isSameOrBefore(untilDate)) {
                                            event.start = currentDate.toDate();
                                            tempEvents.push(event);
                                        }
                                    }
                                }


                            } else if (recurringEvent.cyclePeriod == 'MONTHS') {
                                while (currentDate.isSameOrBefore(untilDate)) {
                                    var event = {
                                        title: subtask.name + ":" + task.name,
                                        start: null,
                                        allDay: allDay,
                                        backgroundColor: color,
                                        task: task,
                                        subtask: subtask
                                    }

                                    currentDate = currentDate.add(recurringEvent.distance, 'month');
                                    if (currentDate.isSameOrBefore(untilDate)) {
                                        event.start = currentDate.toDate();
                                        tempEvents.push(event);
                                    }
                                }

                            } else if (recurringEvent.cyclePeriod == 'DAYS') {
                                while (currentDate.isSameOrBefore(untilDate)) {
                                    var event = {
                                        title: subtask.name + ":" + task.name,
                                        start: null,
                                        allDay: allDay,
                                        backgroundColor: color,
                                        task: task,
                                        subtask: subtask
                                    }

                                    currentDate = currentDate.add(recurringEvent.distance, 'day');
                                    if (currentDate.isSameOrBefore(untilDate)) {
                                        event.start = currentDate.toDate();
                                        tempEvents.push(event);
                                    }
                                }

                            } else if (recurringEvent.cyclePeriod == 'YEARS') {
                                while (currentDate.isSameOrBefore(untilDate)) {
                                    var event = {
                                        title: subtask.name + ":" + task.name,
                                        start: null,
                                        allDay: allDay,
                                        backgroundColor: color,
                                        task: task,
                                        subtask: subtask
                                    }

                                    currentDate = currentDate.add(recurringEvent.distance, 'year');
                                    if (currentDate.isSameOrBefore(untilDate)) {
                                        event.start = currentDate.toDate();
                                        tempEvents.push(event);
                                    }
                                }

                            }
                        } else {
                            resolve([ "aba" ]);
                        }
                    } else {
                        resolve([ "daba" ]);
                    }
                } else {
                    resolve([ "saba" ]);
                }
            }
            console.log("RESOLVING")
            resolve(tempEvents);
        })
        
    })
}