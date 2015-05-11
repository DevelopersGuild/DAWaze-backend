'use strict';

var Db        = require('../config/database');
var Session   = require('./sessions');
var validator = require('validator');
var mongoose  = require('mongoose');

var UserSchema = mongoose.Schema({
    username : { type: String, required: true },
    email    : { type: String, required: true },
    password : { type: String, required: true }
});

var UserMongoModel = Db.model('users', UserSchema);

function createUser(username, password, email, callback) {
    var newUser = new UserMongoModel({
        username : username,
        email    : email,
        password : password
    });

    // Check if newUser.username or newUser.email is already in UserMongoModel
    // TODO: Split into two or find a better way.
    UserMongoModel.find({$or : [{ username : username }, { email : email }]}).limit(1).exec(function(err, user) {
        // TODO: Handle this error

        if (user.length) {

            // TODO: Error message if user already exists.
            callback(err, null);
            return;
        }

        // Saves user to UserMongoModel
        newUser.save(function(err, user) {
            // TODO: Handle this error

            if (user) {
                // Creates a new session with user._id
                Session.create(user._id, function(err, session) {
                    // TODO: Handle this error

                    callback(null, session);
                });
            }
        });
    });
}

function deleteUser(clientToken, callback) {
    Session.findUser(clientToken, function(err, userId) {
        // TODO: Handle this error
        if (err) {
            callback(err);
            return;
        }
        if (userId) {

            // Remove user from UserMongoModel
            UserMongoModel.findByIdAndRemove(userId, function(err) {
                // TODO: Handle this error

                // Removes session from Sessions Db
                Session.delete(clientToken, function(err) {
                    // TODO: Handle this error

                    callback(null)
                });
            });
        }
    });
}


function changeUserPassword(clientToken, oldPassword, newPassword, callback) {
    // TODO: Improve this code
    Session.findUser(clientToken, function(err, userId) {
        // TODO: Handle this error

        if (userId) {
            UserMongoModel.findById(userId, function(err, user) {

                if (!user) {
                    // TODO: Handle this error
                    callback({
                        code    : 400,
                        message : "User doesn't exist"
                    }, null);
                    return;
                }
                // Validate password
                if (user.password != oldPassword) {
                    // TODO: Handle this error
                    callback({
                        code    : 400,
                        message : 'Incorrect Password'
                    }, null);
                    return;
                }
                UserMongoModel.findByIdAndUpdate(userId, { password : newPassword }, function(err) {
                    // TODO: Handle this error
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null);
                });
            });
        }
    });
}

function userAuthentication(usernameEmail, password, callback) {
    UserMongoModel.findOne({$or : [{ username : usernameEmail }, { email : usernameEmail }]}, function(err, user) {
        if (err) {
            callback(err, null);
            return;
        }

        if (user) {

            // TODO: Handle this error
            if (user.password == password) {
                Session.create(user._id, function(err, session) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    callback(null, session);
                });
            } else {
                callback({
                code    : 400,
                message : "Incorrect password."
            }, null);
            }
        } else {
            callback({
                code    : 400,
                message : "Username/Email does not exists."
            }, null);
        }
    });
}

function userReauthentication(clientToken, callback) {
    Session.refresh(clientToken, function(err) {
        // TODO: Handle this error
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, clientToken);
    });
}

function disconnectUser(clientToken, callback) {
    Session.delete(clientToken, function(err) {
        // TODO: Handle this error
        if (err) {
            callback(err);
            return;
        }
        callback(null);
    })
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