'use strict';

var Db        = require('../config/database');
var Session   = require('./sessions');
var validator = require('validator');
var mongoose  = require('mongoose');
var async     = require('async');

// Create the schema for a user
var UserSchema = mongoose.Schema({
  username      : { type: String, required: true },
  usernameLower : { type: String, required: true },
  email         : { type: String, required: true },
  password      : { type: String, required: true }
});

// Creates a collection named users in MongoDB
var UserMongoModel = Db.model('users', UserSchema);

// Takes username, password, email and saves a new user to MongoDB
function createUser(username, password, email, callback) {
  async.waterfall([

    // TODO: Try to put these in a parallel
    function(next) {

      // Check if newUser.username is already in UserMongoModel
      UserMongoModel.findOne({ usernameLower : username.toLowerCase() },
                     function(err, user) {
        if (user) {
          next({
            code    : 400,
            message : 'Username already exists'
          });
        }
        next(null);
      });
    },
    function(next) {

      // Check if newUser.email is already in UserMongoModel
      UserMongoModel.findOne({ email : email.toLowerCase() },
                             function(err, user) {
        if (user) {
          next({
            code    : 400,
            message : 'Email already exists'
          });
        }
        next(null);
      });
    },
    function(next) {
      var newUser = new UserMongoModel({
        username      : username,
        usernameLower : username.toLowerCase(),
        email         : email.toLowerCase(),
        password      : password
      });

      newUser.save(function(err, user) {
        if (err) {

          // TODO: Error message?
          next(err);
        }
        next(null, user);
      });
    },
    function(user, next) {
      Session.create(user._id, function(err, session) {
        if (err) {

          // Error message handled by session model
          next(err);
        }
        next(null, session);
      });
    }
  ], callback);
}

// Takes a token string and deletes the associated user and session from MongoDB
function deleteUser(clientToken, callback) {
  async.waterfall([
    function(next) {
      Session.findUser(clientToken, function(err, userId) {
        if (err) {

          // Error message handled by session model
          next(err);
        }
        next(null, userId);
      });
    },

    // TODO: Should user removal and session destruction happen in parralel?
    function(userId, next) {

      // Remove user from UserMongoModel
      UserMongoModel.findByIdAndRemove(userId,
                                       function(err, user) {
        if (err) {
          // TODO: Error message?
          next(err);
        }
        next(null);
      });
    },
    function(next) {

      // Removes session from sessions collection
      Session.destroy(clientToken, function(err) {
        if (err) {
          // Error message handled by session model
          next(err);
        }
        next(null);
      });
    }
  ], callback);
}

// Takes a token string, password, new password and updates the user collection
// with new password
function changeUserPassword(clientToken, oldPassword, newPassword, callback) {
  async.waterfall([
    function(next) {
      Session.findUser(clientToken, function(err, userId) {
        if (err) {

          // Error message handled by session model
          next(err);
        }
        next(null, userId);
      });
    },
    function(userId, next) {
      UserMongoModel.findById(userId, function(err, user) {
        if (err) {

          // TODO: Error message?
          next(err);
        } else if (!user) {
          next({
            code    : 400,
            message : 'User does not exist.'
          });
        } else if (user.password != oldPassword) {
          next({
            code    : 400,
            message : 'Incorrect Password'
          });
        }
        next(null, userId);
      });
    },
    function(userId, next) {
      UserMongoModel.findByIdAndUpdate(userId, { password : newPassword },
                                       function(err, user) {
        if (err) {

          // TODO: Error message?
          next(err);
        }
        next(null);
      });
    }
  ], callback);
}

// Takes a username/email and password and creates a new session,
// returning the session to callback
function userAuthentication(usernameEmail, password, callback) {
  async.waterfall([
    function(next) {
      UserMongoModel.findOne({$or : [
                         { usernameLower : usernameEmail.toLowerCase() },
                         { email : usernameEmail.toLowerCase() }]},
                         function(err, user) {
        if (err) {

          // TODO: Error message?
          next(err);
        } else if (!user) {
          next({
            code    : 400,
            message : 'Username/Email does not exists.'
          });
        } else if (user.password != password) {
          next({
            code    : 400,
            message : 'Incorrect password.'
          });
        }
        next(null, user);
      });
    },
    function(user, next) {
      Session.create(user._id, function(err, session) {
        if (err) {

          // Error message handled by session model
          next(err);
        }
        next(null, session);
      });
    }
  ], callback);
}


// Takes a token string, deletes found session and creates a new one
function userReauthentication(clientToken, callback) {
  async.waterfall([
    function(next) {
      Session.findUser(clientToken, function(err, userId) {
        if (err) {

          // Error message handled by session model
          next(err);
        }
        next(null, userId);
      });
    },
    function(userId, next) {
      Session.destroy(clientToken, function(err, session) {
        if (err) {

          // Error message handled by session model
          next(err);
        }
        next(null, userId);
      });
    },
    function(userId, next) {
      Session.create(userId, function(err, token) {
        if (err) {

          // Error message handled by session model
          next(err);
        }
        next(null, token);
      });
    }
  ], callback);
}

// Takes a token string and removes session from MongoDB
function disconnectUser(clientToken, callback) {
  Session.destroy(clientToken, function(err) {
    if (err) {

      // Error message handled by session model
      callback(err);
      return;
    }
    callback(null);
  });
}

var UserModel = {
  create         : createUser,
  delete         : deleteUser,
  changePassword : changeUserPassword,
  login          : userAuthentication,
  reauthenticate : userReauthentication,
  logout         : disconnectUser
};

module.exports = UserModel;
