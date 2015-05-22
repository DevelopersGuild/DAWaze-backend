'use strict';

var Db        = require('../config/database');
var Session   = require('./sessions');
var validator = require('validator');
var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt');
var async     = require('async');

// Create the schema for a user
var UserSchema = mongoose.Schema({
  username      : { type: String, required: true },
  usernameLower : { type: String, required: true },
  email         : { type: String, required: true },
  password      : { type: String, required: true }
});

/* "When you are hashing your data the module will go through a series of
 *  rounds to give you a secure hash. The value you submit there is not just
 *  the number of rounds that the module will go through to hash your data.
 *  The module will use the value you enter and go through 2^rounds iterations
 *  of processing.
 *
 * "On a 2GHz core you can roughly expect:
 *
 * "rounds=10: ~10 hashes/sec
 *  rounds=13: ~1 sec/hash
 *  rounds=25: ~1 hour/hash
 *  rounds=31: 2-3 days/hash"
 *
 * @see https://www.npmjs.com/package/bcrypt
 */
var BCRYPT_SALT_ROUNDS = 10;

// Creates a collection named users in MongoDB
var UserMongoModel = Db.model('users', UserSchema);

// Takes username, password, email and saves a new user to MongoDB
function createUser(username, password, email, callback) {
  async.parallel([

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
        } else {
          next(null);
        }
      });
    }, function(next) {

      // Check if newUser.email is already in UserMongoModel
      UserMongoModel.findOne({ email : email.toLowerCase() },
                             function(err, user) {
        if (user) {
          next({
            code    : 400,
            message : 'Email already exists'
          });
        } else {
          next(null);
        }
      });
    }
  ], function(err) {
    if (err) {
      callback(err);
    } else {

      async.waterfall([
        function(next) {

          bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function(err, hash) {
            if (err) {
              next(err);
            } else {
              next(null, hash);
            }
          });

        }, function(hash, next) {
          UserMongoModel.create({
            username      : username,
            usernameLower : username.toLowerCase(),
            email         : email.toLowerCase(),
            password      : hash
          }, function(err, user) {
            if (err) {

              // TODO: Error message?
              next(err);
            } else {
              next(null, user._id);
            }
          });

        }
      ], function(err, userId) {
        if (err) {
          callback(err);
        } else {
          Session.create(userId, callback);
        }
      });
    }
  });
}

// Takes a token string and deletes the associated user and session from MongoDB
function deleteUser(clientToken, callback) {
  async.waterfall([
    function(next) {
      Session.findUser(clientToken, next);
    },

    function(userId, next) {

      // Remove user from UserMongoModel
      UserMongoModel.findByIdAndRemove(userId,
        function(err) {
          if (err) {
            // TODO: Error message?
            next(err);
          } else {
            next(null, userId);
          }
        }
      );
    },
    function(userId, next) {

      // Removes session from sessions collection
      Session.destroyAll(userId, next);
    }
  ], callback);
}

// Takes a token string, password, new password and updates the user collection
// with new password
function changeUserPassword(clientToken, oldPassword, newPassword, callback) {
  async.waterfall([
    function(next) {
      Session.findUser(clientToken, next);
    }, function(userId, next) {
      UserMongoModel.findById(userId, function(err, user) {
        if (err) {

          // TODO: Error message?
          next(err);
        } else if (!user) {
          next({
            code    : 400,
            message : 'User does not exist.'
          });
        } else {
          next(null, user);
        }
      });
    }, function(user, next) {
      bcrypt.compare(oldPassword, user.password, function(err, isCorrect) {
        if (err) {
          next(err);
        } else if (!isCorrect) {
          next({
            code    : 400,
            message : 'You entered the wrong password!'
          });
        } else {
          next(null, user);
        }
      });
    }, function(user, next) {
      bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS, function(err, hash) {
        if (err) {
          next(err);
        } else {
          next(null, hash, user);
        }
      });
    }, function(hash, user, next) {
      UserMongoModel.findByIdAndUpdate(user._id, { password : hash }, next );
    }
  ], callback);
}

// Takes a username/email and password and creates a new session,
// returning the session to callback
function userAuthentication(usernameEmail, password, callback) {
  async.waterfall([
    function(next) {
      UserMongoModel.findOne(
        {$or : [
          { usernameLower : usernameEmail.toLowerCase() },
          { email : usernameEmail.toLowerCase() }
        ]}, function(err, user) {
          if (err) {

            // TODO: Error message?
            next(err);
          } else if (!user) {
            next({
              code    : 400,
              message : 'Username/Email does not exists.'
            });
          } else {
            next(null, user);
          }
        }
      );
    }, function(user, next) {
      bcrypt.compare(password, user.password, function(err, isCorrect) {
        if (err) {
          next(err);
        } else if (!isCorrect) {
          next({
            code    : 400,
            message : 'You entered the wrong password!'
          });
        } else {
          next(null, user);
        }
      });
    }, function(user, next) {
      Session.create(user._id, next);
    }
  ], callback);
}


// Takes a token string, deletes found session and creates a new one
function userReauthentication(clientToken, callback) {
  async.waterfall([
    function(next) {
      Session.findUser(clientToken, next);
    }, function(userId, next) {
      Session.create(userId, next);
    }, function(token, next) {
      Session.destroy(clientToken, next);
    }
  ], callback);
}

// Takes a token string and removes session from MongoDB
function userLogout(clientToken, callback) {
  Session.destroy(clientToken, callback);
}

var UserModel = {
  create         : createUser,
  delete         : deleteUser,
  changePassword : changeUserPassword,
  login          : userAuthentication,
  reauthenticate : userReauthentication,
  logout         : userLogout
};

module.exports = UserModel;
