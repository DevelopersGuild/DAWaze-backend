var Db        = require('../config/database');
var mongoose  = require('mongoose');
var crypto    = require('crypto')

// Generates a random string to use as a session token
function generateToken() {
    return crypto.randomBytes(256).toString('base64');
}

// Create the schema for a session
var SessionSchema = mongoose.Schema({

    // Defaults to a string of 256 characters
    token     : { type : String, default : generateToken },

    // Defaults to the current time and expires in 7 days
    createdAt : { type : Date, default : Date.now, expires : '7d' },

    // Holds the ObjectId of the user logged into this session
    userId    : { type : mongoose.Schema.Types.ObjectId, required : true}
});

// Creates a collection named sessions in MongoDB
var SessionMongoModel = Db.model('sessions', SessionSchema);

// Takes a userId as an argument and returns the token string to the callback
function findSessionByUserId(userId, callback) {
    SessionMongoModel.findOne({ userId : userId }, function(err, session) {
        if (err) {
            // TODO: Error message?
            callback(err, null);
        } else if (!session) {
            callback({
                code    : 400,
                message : 'The session does not exist.'
            });
        } else {
            callback(null, session.token);
        }
    });
}

// Takes a token string as an argument and returns the userId to the callback
function findUserByToken(clientToken, callback) {
    SessionMongoModel.findOne({ token : clientToken }, function(err, session) {
        if (err) {
            // TODO: Error message?
            callback(err, null);
        } else if (!session) {
            callback({
                code    : 400,
                message : 'The session does not exists.'
            });
        } else {
            callback(null, session.userId);
        }
    });
}

// Creates a new session and attach user ObjectId to it
function createSession(userId, callback) {
    var newSession = new SessionMongoModel({ userId : userId });

    newSession.save(function (err, session) {
        if (err) {
            // TODO: Error message?
            callback(err, null);
        } else if (!session) {
            callback({
                code    : 400,
                message : 'Session creation failed.'
            });
        } else {
            callback(null, session);
        }
    });
}

// Takes a token string and deletes the session with that string from MongoDB
function destroySession(clientToken, callback) {
    SessionMongoModel.findOneAndRemove({ token : clientToken }, 
                                       function(err) {
        if (err) {
            // TODO: Error message?
            callback(err);
            return; 
        }
        callback(null);
    });
}

// Takes a token string, deletes the associated session, and makes a new one,
// returning the new token to the callback
function refreshSession(clientToken, callback) {
    SessionMongoModel.findOne({ token : clientToken },
                              function(err, session) {
        if (err) {
            // TODO: Error message?
            callback(err);
        } else if (!session) {
            callback({
                code    : 400,
                message : 'The session does not exists.'
            });
        } else {
            createSession(session.userId, function(err, newSession) {
                if (err) {
                    callback(err);
                } else {
                    destroySession(clientToken, function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, newSession);
                        }
                    })
                }
            });
        }
    });
}



var SessionModel = {
    findSession : findSessionByUserId,
    findUser    : findUserByToken,
    create      : createSession,
    destroy     : destroySession,
    refresh     : refreshSession
};

module.exports = SessionModel;
