var Db        = require('../config/database');
var mongoose  = require('mongoose');
var crypto    = require('crypto')

function generateToken() {
	return crypto.randomBytes(256).toString('base64');
}

var SessionSchema = mongoose.Schema({
    token	  : { type : String, default : generateToken },
    createdAt : { type : Date, default : Date.now, expires : '7d' },
    userId    : { type : mongoose.Schema.Types.ObjectId, required : true}
});

var SessionMongoModel = Db.model('sessions', SessionSchema);

function findSessionByUserId(userId, callback) {
	SessionMongoModel.findOne({ userId : userId }, function(err, session) {
		// TODO: Handle this error

		if (session) {
			callback(null, session.token);
		}
	});
}

function findUserByToken(clientToken, callback) {
	SessionMongoModel.findOne({ token : clientToken }, function(err, session) {
		// TODO: Handle this error
		if (err) {
			callback(err, null);
			return;
		}
		if (session)
			callback(null, session.userId);
	});
}

function createSession(userId, callback) {
	var newSession = new SessionMongoModel({ userId : userId });

	newSession.save(function (err, session) {
		// TODO: Handle this error

		if (session)
			callback(null, session);
	});
}

function deleteSession(clientToken, callback) {
	SessionMongoModel.findOneAndRemove({ token : clientToken }, function(err, doc) {
		// TODO: Handle this error
		if (err) {
			callback(err);
			return;
		}
		if (!doc) {
			callback({
				code	: 400,
				message : 'Session no longer exists.'
			});
			return;
		}
		callback(null);
	});
}

function refreshSession(clientToken, callback) {
	SessionMongoModel.findOneAndUpdate({ token : clientToken },
									   {$set : { createdAt : Date.now }},
									   function(err) {
		// TODO: Handle this error
		if (err) {
			callback(err);
			return;
		}
		callback(null);
	})
}



var SessionModel = {
	findSession : findSessionByUserId,
	findUser    : findUserByToken,
	create      : createSession,
	delete      : deleteSession,
	refresh     : refreshSession
};

module.exports = SessionModel;