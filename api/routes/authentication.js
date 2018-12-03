const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth/auth');
const User = require('../models/user');

/**
 * @author Damian Cywinski <218396@student.pwr.edu.pl>
 */

/**
 * Registration to the system.
 *
 * @name Authentication - Registration
 * @route {POST} /auth
 * @bodyparam {String} email for the user that tries to login
 * @bodyparam {String} password for the user that tries to login
 * @authentication For this route, authentication is optional, as anyone can try to register.
 */
router.post('/', auth.optional, (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    res.json({ success: false, msg: 'Please pass username and password.' });
  } else {

    var newUser = new User({
      email: req.body.email,
      salt: req.body.password,
      hash: req.body.password
    });

    newUser.setPassword(req.body.password);

    newUser.save(function (err) {
      if (err) {
        console.log(err);
        return res.json({ success: false, msg: 'Username already exists.' });
      }
      res.json({ success: true, msg: 'Successful created new user.' });
    });
  }
});

/**
 * Login to the system.
 *
 * @name Authentication - Login
 * @route {POST} /auth/login
 * @bodyparam {String} email for the user that tries to login
 * @bodyparam {String} password for the user that tries to login
 * @authentication For this route, authentication is optional, as anyone can try to login.
 */
router.post('/login', auth.optional, (req, res, next) => {
  // Get user data from request
  const { body: { user } } = req;

  // Check if email is present
  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  // Check if password is present
  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  // Authenticate user
  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const user = passportUser;

      // Generate JWT token according to the user data
      user.token = passportUser.generateJWT();

      // Return generated token
      res.json({ success: true, token: 'Token ' + user.token });
    } else {
      res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
    }

    return status(400).info;
  })(req, res, next);
});

/**
 * Getting current logged user.
 *
 * @name Authentication - Current user
 * @route {GET} /auth/current
 * @authentication For this route, authentication is required.
 */
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return User.findById(id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;