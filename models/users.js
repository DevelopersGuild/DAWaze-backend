'use strict';

var Db        = require('../config/database');
var Session   = require('./sessions');
var validator = require('validator');
var mongoose  = require('mongoose');

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
  var newUser = new UserMongoModel({
    username      : username,
    usernameLower : username.toLowerCase(),
    email         : email,
    password      : password
  });

  // Check if newUser.username is already in UserMongoModel
  UserMongoModel.findOne({ usernameLower : username.toLowerCase() }, function(err, user) {
    if (user) {
      callback({
        code    : 400,
        message : 'Username already exists'
      });
    } else {

      // Check if newUser.email is already in UserMongoModel
      UserMongoModel.findOne({ email : email.toLowerCase() }, function(err, user) {
        if (user) {
          callback({
            code    : 400,
            message : 'Email already exists'
          });
        } else {

          // Saves user to UserMongoModel
          newUser.save(function(err, user) {
            if (err) {
              // TODO: Error message?
              callback(err);
            } else if (!user) {
              callback({
                code    : 400,
                message : 'User creation failed.'
              });
            } else {

              // Creates a new session with user._id
              Session.create(user._id, function(err, session) {
                if (err) {
                  // Error message handled by session model
                  callback(err);
                  return;
                }
                callback(null, session);
              });
            } 
          });
        }
      });
    }
  });
}

// Takes a token string and deletes the associated user and session from MongoDB
function deleteUser(clientToken, callback) {
  Session.findUser(clientToken, function(err, userId) {
    if (err) {
      // Error message handled by session model
      callback(err);
    } else {

      // Remove user from UserMongoModel
      UserMongoModel.findByIdAndRemove(userId.toLowerCase(), function(err, user) {
        if (err) {
          // TODO: Error message?
          callback(err);
        } else {

          // Removes session from sessions collection
          Session.destroy(clientToken, function(err) {
            if (err) {
              // Error message handled by session model
              callback(err);
              return;
            }
            callback(null);
          });
        }
      });
    }
  });
}

// Takes a token string, password, new password and updates the user collection with new password
function changeUserPassword(clientToken, oldPassword, newPassword, callback) {
  // TODO: Improve this code
  Session.findUser(clientToken, function(err, userId) {
    if (err) {
      // Error message handled by session model
      callback(err);
    } else {
      UserMongoModel.findById(userId.toLowerCase(), function(err, user) {
        if (err) {
          // TODO: Error message?
          callback(err);
        } else if (!user) {
          callback({
            code    : 400,
            message : "User does not exist."
          });
        } else {

          // Verify password
          if (user.password != oldPassword) {
            callback({
              code    : 400,
              message : 'Incorrect Password'
            });
          } else {
            UserMongoModel.findByIdAndUpdate(userId.toLowerCase(),
                                             { password : newPassword },
                                             function(err, user) {
              if (err) {
                // TODO: Error message?
                callback(err);
                return;
              }
              callback(null);
            });
          }
        }
      });
    }
  });
}

// Takes a username/email and password and creates a new session, returning the token string to callback
function userAuthentication(usernameEmail, password, callback) {
  UserMongoModel.findOne({$or : [{ usernameLower : usernameEmail.toLowerCase() },
                         { email : usernameEmail.toLowerCase() }]}, 
                         function(err, user) {
    if (err) {
      // TODO: Error message?
      callback(err);
    } else if (!user) {
      callback({
        code    : 400,
        message : "Username/Email does not exists."
      });
    } else {

      // Verify password
      if (user.password != password) {
        callback({
          code    : 400,
          message : "Incorrect password."
        });
      } else {
        Session.create(user._id, function(err, session) {
          if (err) {
            // Error message handled by session model
            callback(err);
            return;
          }
          callback(null, session);
        });
      }    
    }
  });
}

// Takes a token string and verifies session exists
function userReauthentication(clientToken, callback) {
  Session.refresh(clientToken, function(err, session) {
    if (err) {
      // Error message handled by session model
      callback(err, null);
      return;
    }
    callback(null, session);
  });
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
