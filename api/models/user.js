const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  }
}, { toJSON: { virtuals: true }, toObject : {virtuals:true} });

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'user'
});

userSchema.virtual('subtasks', {
  ref: 'Subtask',
  localField: '_id',
  foreignField: 'user'
});

userSchema.virtual('recurringEvents', {
  ref: 'RecurringEvent',
  localField: '_id',
  foreignField: 'user'
});

userSchema.virtual('categories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'user'
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

userSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    email: this.email,
    id: this._id,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
}

userSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    token: this.generateJWT(),
  };
};

userSchema.plugin(deepPopulate);
module.exports = mongoose.model('User', userSchema)