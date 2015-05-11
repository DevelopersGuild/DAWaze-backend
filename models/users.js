'use strict';

var Db        = require('../config/database');
var Session   = require('./sessions');
var validator = require('validator');
var mongoose  = require('mongoose');

// Create the schema for a user
var UserSchema = mongoose.Schema({
    username : { type: String, required: true },
    email    : { type: String, required: true },
    password : { type: String, required: true }
});

// Creates a collection named users in MongoDB
var UserMongoModel = Db.model('users', UserSchema);

// Takes username, password, email and saves a new user to MongoDB
function createUser(username, password, email, callback) {
    var newUser = new UserMongoModel({
        username : username,
        email    : email,
        password : password
    });

    // Check if newUser.username is already in UserMongoModel
    UserMongoModel.find({ username : username }).limit(1).exec(function(err, user) {
        if (user.length) {
            callback({
                code    : 400,
                message : 'Username already exists'
            }, null);
            return;
        }
    });
    
    // Check if newUser.email is already in UserMongoModel
    UserMongoModel.find({ email : email }).limit(1).exec(function(err, user) {
        if (user.length) {
            callback({
                code    : 400,
                message : 'Email already exists'
            }, null);
            return;
        }
    });

    // Saves user to UserMongoModel
    newUser.save(function(err, user) {
        if (err) {
            // TODO: Error message?
            callback(err, null);
            return;
        }
        if (user) {

            // Creates a new session with user._id
            Session.create(user._id, function(err, session) {
                if (err) {
                    // Error message handled by session model
                    callback(err);
                    return;
                }
                callback(null, session);
            });
        } else
            callback({
                code    : 400,
                message : 'User creation failed.'
            }, null);
    });
}

// Takes a token string and deletes the associated user and session from MongoDB
function deleteUser(clientToken, callback) {
    Session.findUser(clientToken, function(err, userId) {
        if (err) {
            // Error message handled by session model
            callback(err);
            return;
        }
        
        // Remove user from UserMongoModel
        UserMongoModel.findByIdAndRemove(userId, function(err, user) {
            if (err) {
                // TODO: Error message?
                callback(err);
                return;
            }
            if (user) {
                callback({
                    code    : 400,
                    message : 'User deletion failed.'
                });
                return;
            }

            // Removes session from sessions collection
            Session.delete(clientToken, function(err) {
                if (err) {
                    // Error message handled by session model
                    callback(err);
                    return;
                }
                callback(null)
            });
        });
        
    });
}

// Takes a token string, password, new password and updates the user collection with new password
function changeUserPassword(clientToken, oldPassword, newPassword, callback) {
    // TODO: Improve this code
    Session.findUser(clientToken, function(err, userId) {
        if (err) {
            // Error message handled by session model
            callback(err);
            return;
        }
        UserMongoModel.findById(userId, function(err, user) {
            if (err) {
                // TODO: Error message?
                callback(err);
                return;
            }
            if (user) {

                // Verify password
                if (user.password != oldPassword) {
                    callback({
                        code    : 400,
                        message : 'Incorrect Password'
                    }, null);
                    return;
                }
                UserMongoModel.findByIdAndUpdate(userId, { password : newPassword }, function(err, user) {
                if (err) {
                    // TODO: Error message?
                    callback(err);
                    return;
                }
                callback(null);
                });
            } else
                callback({
                    code    : 400,
                    message : "User does not exist."
                }, null);
        });
    });
}

// Takes a username/email and password and creates a new session, returning the token string to callback
function userAuthentication(usernameEmail, password, callback) {
    UserMongoModel.findOne({$or : [{ username : usernameEmail }, { email : usernameEmail }]}, function(err, user) {
        if (err) {
            // TODO: Error message?
            callback(err, null);
            return;
        }
        if (user) {
            // Verify password
            if (user.password == password) {
                Session.create(user._id, function(err, session) {
                    if (err) {
                        // Error message handled by session model
                        callback(err, null);
                        return;
                    }
                    callback(null, session);
                });
            } else
                callback({
                    code    : 400,
                    message : "Incorrect password."
                }, null);
        } else
            callback({
                code    : 400,
                message : "Username/Email does not exists."
            }, null);
    });
}

// Takes a token string and verifies session exists
function userReauthentication(clientToken, callback) {
    Session.refresh(clientToken, function(err) {
        if (err) {
            // Error message handled by session model
            callback(err, null);
            return;
        }
        callback(null, clientToken);
    });
}

// Takes a token string and removes session from MongoDB
function disconnectUser(clientToken, callback) {
    Session.delete(clientToken, function(err) {
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