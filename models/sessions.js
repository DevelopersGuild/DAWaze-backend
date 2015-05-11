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
    token	  : { type : String, default : generateToken },

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
			return;
		}
		if (session)
			callback(null, session.token);
		else
			callback({
				code	: 400,
				message : 'The session does not exist.'
			}, null);
	});
}

// Takes a token string as an argument and returns the userId to the callback
function findUserByToken(clientToken, callback) {
	SessionMongoModel.findOne({ token : clientToken }, function(err, session) {
		if (err) {
			// TODO: Error message?
			callback(err, null);
			return;
		}
		if (session)
			callback(null, session.userId);
		else
			callback({
				code	: 400,
				message : 'The session does not exists.'
			}, null);
	});
}

// Creates a new session and attach user ObjectId to it
function createSession(userId, callback) {
	var newSession = new SessionMongoModel({ userId : userId });

	newSession.save(function (err, session) {
		if (err) {
			// TODO: Error message?
			callback(err, null);
			return;
		}
		if (session)
			callback(null, session);
		else 
			callback({
				code	: 400,
				message : 'Session creation failed.'
			}, null);
	});
}

// Takes a token string and deletes the session with that string from MongoDB.
function deleteSession(clientToken, callback) {
	SessionMongoModel.findOneAndRemove({ token : clientToken }, function(err, session) {
		if (err) {
			// TODO: Error message?
			callback(err);
			return;
		}
		if (session)
			callback({
				code	: 400,
				message : 'Session deletion failed.'
			});
		else 
			callback(null);
	});
}

// Takes a token string and update the createdAt field to Date.now()
function refreshSession(clientToken, callback) {
	SessionMongoModel.findOneAndUpdate({ token : clientToken },
									   {$set : { createdAt : Date.now }},
									   function(err, session) {
		if (err) {
			// TODO: Error message?
			callback(err);
			return;
		}
		callback(null);
	});
}



var SessionModel = {
	findSession : findSessionByUserId,
	findUser    : findUserByToken,
	create      : createSession,
	delete      : deleteSession,
	refresh     : refreshSession
};

module.exports = SessionModel;