const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('./api/config/passport_config');


mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/wide-db', { promiseLibrary: require('bluebird') })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

const entryRoutes = require('./api/routes/entries');
const authRoutes = require('./api/routes/authentication')
const taskRoutes = require('./api/routes/tasks');
const categoryRoutes = require('./api/routes/categories')
const recurringEventRoutes = require('./api/routes/recurringEvents')
const subTasksRoutes = require('./api/routes/subTasks')
const materialsRoutes = require('./api/routes/materials')
const historyRoutes = require('./api/routes/history')

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Allow CORS
app.use((req, res, next) => {
    // Setting headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    // Allowing methods
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-ALlow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// API routes
app.use('/entries', entryRoutes);
app.use('/auth', authRoutes);

app.use("/tasks", taskRoutes);
app.use("/categories", categoryRoutes);

app.use("/events", recurringEventRoutes);
app.use("/subtasks", subTasksRoutes);
app.use("/materials", materialsRoutes);
app.use("/history", historyRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
})

module.exports = app;