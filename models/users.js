'use strict';

var Db 			= require('/../config/database');
var crypto 		= require('crypto');
var validator 	= require('validator');

var UserSchema = mongoose.Schema({
    username	: {type: String, required: true},
    email       : {type: String, required: true},
    password    : {type: String, required: true},
    token 		: {type: String, required: true}
});

var UserMongoModel = Db.model('users', UserSchema);

function generateToken() {
	var token;

	crypto.randomBytes(256, function(err, nonce) {
		// TODO: Handle this error
		token = nonce.toString('base64');
	});
	return token
}

function createToken(ttl) {
	var token = {
		tokenID : generateToken(),
		ttl		: Date.now() + ttl
	}
	return token;
}

function createUser(username, password, email, callback) {
	var newUser = {
		username 	: username,
		email 		: email,
		password 	: password,
		token 		: null 	// How to set expiration time in the DB?
	}

	// TODO: Check if newUser.username / newUser.email / newUser.token is already in the db

	UserMongoModel.create(newUser, function(err, user) {
		callback(err, user);
	});
}

function deleteUser(tokenID, callback) {
	UserMongoModel.findOneAndRemove({ token.tokenID : tokenID }).exec(callback);	// TODO: Error code && message?
}

function changeUserPassword(tokenID, oldPassword, newPassword, callback) {
	UserMongoModel.findOne({ token.tokenID : tokenID, password : oldPassword }, function(err, user) {
		if (err) {
			callback(err);	// TODO: Error code && message?
			return;
		}
		user.password = newPassword;
		callback(err);
	});
}

function userAuthentication(usernameEmail, password, callback) {
	var ttl = 6000;	// TODO: Determine ttl
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
			callback(err, user.token);
		});
	} else {
		UserMongoModel.findOne({ email : usernameEmail, password : password }, function(err, user) {
			if (err) {
				// TODO: Error code && message?
				callback(err, null);
				return;
			}
			user.token = newToken;
			callback(err, user.token);
		});
	}
}

function userReauthentication(tokenID, callback) {
	UserMongoModel.findOne({ token.tokenID : tokenID}, function(err, user) {
		if (err) {
			// TODO: Error code && message?
			callback(err, null);
			return;
		}
		// TODO: Extend token expiration time
		callback(err, user.token);
	});
}

function disconnectUser(tokenID, callback) {
	UserMongoModel.findOne({ token.tokenID : tokenID}, function(err, user) {
		if (err) {
			// TODO: Error code && message?
			callback(err);
			return;
		}
		// TODO: Delete token
		callback(err);
}

var UserModel = {
	create 			: createUser,
	delete 			: deleteUser,
	changePassword 	: changeUserPassword,
	login 			: userAuthentication,
	reauthenticate 	: userReauthentication,
	logout 			: disconnectUser
};

module.exports = UserModel;