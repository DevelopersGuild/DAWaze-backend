'use strict';

var Db        = require('../config/database');
var mongoose  = require('mongoose');
var crypto    = require('crypto');

// 7 days in milliseconds
var TTL = 604800000;

var ObjectId  = mongoose.Schema.ObjectId;

// Generates a random string to use as a session token
function generateToken() {
  return crypto.randomBytes(256).toString('base64');
}

function createExpirationDate() {
  return (Date.now() + TTL);
}

// Create the schema for a session
var SessionSchema = mongoose.Schema({

  // Defaults to a string of 256 characters
  token     : { type : String, default : generateToken },

  // Defaults to the current time and expires in 7 days
  createdAt : { type : Date, default : Date.now, expires : '7d' },

  // Defaults to the current time + 7 days
  expireAt  : { type : Date, default : createExpirationDate },

  // Holds the ObjectId of the user logged into this session
  userId    : { type : ObjectId, required : true}
});

// Creates a collection named sessions in MongoDB
var SessionMongoModel = Db.model('sessions', SessionSchema);

// Takes a userId as an argument and returns the token string to the callback
function findSessionByUserId(userId, callback) {
  SessionMongoModel.findOne({ userId: userId },
                            function(err, session) {
    if (err) {
      // TODO: Error message?
      callback(err);
    } else if (!session) {
      callback({
        code    : 400,
        message : 'Session not found.'
      });
    } else {
      callback(null, session.token);
    }
  });
}

// Takes a token string as an argument and returns ths userId to the callback
function findUserByToken(clientToken, callback) {
  SessionMongoModel.findOne({ token: clientToken }, function(err, session) {
    if (err) {

      // TODO: Error message?
      callback(err, null);
    } else if (!session) {
      callback({
        code    : 400,
        message : 'Session not found.'
      });
    } else {
      callback(null, session.userId);
    }
  });
}

// Creates a new session and attach user ObjectId to it
function createSession(userId, callback) {
 SessionMongoModel.create({ userId: userId }, callback);
}

// Takes a token string and deletes the session with that string from MongoDB
function destroySession(clientToken, callback) {
  SessionMongoModel.findOneAndRemove({ token: clientToken },
    function(err, session) {
      if (err) {

        // TODO: Error message?
        callback(err, null);
      } else if (!session) {
        callback({
          code    : 400,
          message : 'Session not found.'
        });
      } else {
        callback(null);
      }
    }

  );
}

function destroyAllSessions(userId, callback) {
  SessionMongoModel.remove({ userId: userId }, callback);
}


var SessionModel = {
  findSession : findSessionByUserId,
  findUser    : findUserByToken,
  create      : createSession,
  destroy     : destroySession,
  destroyAll  : destroyAllSessions
};

module.exports = SessionModel;
