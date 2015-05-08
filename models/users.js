'use strict';

var Db        = require('/../config/database');
var crypto    = require('crypto');
var validator = require('validator');

var UserSchema = mongoose.Schema({
    username : { type: String, required: true },
    email    : { type: String, required: true },
    password : { type: String, required: true },
    token    : { type: String, required: true }
});

var UserMongoModel = Db.model('users', UserSchema);

// Generates a random unique token ID
function generateToken() {
    var token;

    crypto.randomBytes(256, function(err, nonce) {
        // TODO: Handle this error
        token = nonce.toString('base64');
    });
    return token;
}

// Returns the default Time-To-Live of a token
function getTtl() {
    var ttl = 6000; // Decide default ttl
    return ttl;
}

// Extends a token's Time-To-Live to the default ttl
var extendTtl = function defaultTtl() {
    return Date.now() + getTtl();
}

// Creates and return a new token with a unique ID and a Time-To-Live
function createToken(ttl) {
    var token = {
        tokenID : generateToken(),
        ttl     : Date.now() + defaultTtl()
    }
    return token;
}


function createUser(username, password, email, callback) {
    var newUser = {
        username : username,
        email    : email,
        password : password,
        token    : createToken(getTtl())  // How to set expiration time in the DB?
    }

    // Check if newUser.username is already in the db
    UserMongoModel.findOne({ username : username }, function(err, user) {
        if (err) {
            // TODO: Error code && message?
            callback(err, null);
            return;
        }
    });

    // Check if newUser.email is already in the db
    UserMongoModel.findOne({ email : email }, function(err, user) {
        if (err) {
            // TODO: Error code && message?
            callback(err, null);
            return;
        }
    });

    UserMongoModel.create(newUser, function(err, user) {
        callback(null, user.token);
    });
}

function deleteUser(tokenID, callback) {
    UserMongoModel.findOneAndRemove({ token.tokenID : tokenID }, function(err, user) {
        if (err) {
            // TODO: Error code && message?
            callback(err);
            return;
        }
        // TODO: Delete the user form the database
        callback(err)
    });
}

function changeUserPassword(tokenID, oldPassword, newPassword, callback) {
    UserMongoModel.findOne({ token.tokenID : tokenID, password : oldPassword }, function(err, user) {
        if (err) {
            // TODO: Error code && message?
            callback(err);
            return;
        }
        user.password = newPassword;
        callback(null);
    });
}

function userAuthentication(usernameEmail, password, callback) {
    var newToken = createToken(ttl);

    // TODO: How to make this code cleaner?
    if (!validator.isEmail(usernameEmail)) {
        UserMongoModel.findOne({ username : usernameEmail, password : password }, function(err, user) {
            if (err) {
                // TODO: Error code && message?
                callback(err, null);
                return;
            }
            user.token = newToken;
            callback(null, user.token);
        });
    } else {
        UserMongoModel.findOne({ email : usernameEmail, password : password }, function(err, user) {
            if (err) {
                // TODO: Error code && message?
                callback(err, null);
                return;
            }
            user.token = newToken;
            callback(null, user.token);
        });
    }
}

function userReauthentication(tokenID, callback) {
    UserMongoModel.findOne({ token.tokenID : tokenID }, function(err, user) {
        if (err) {
            // TODO: Error code && message?
            callback(err, null);
            return;
        }

        // Extend token expiration time
        user.token.tll = extendTtl());
        callback(null, user.token);
    });
}

function disconnectUser(tokenID, callback) {
    UserMongoModel.findOne({ token.tokenID : tokenID }, function(err, user) {
        if (err) {
            // TODO: Error code && message?
            callback(err);
            return;
        }

        // Deletes current session token
        user.token = null;
        callback(null);
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