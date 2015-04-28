'use strict';

module.exports = function(app) {

	var validator = require('validator');
	var User = require('/../models/user');

	// Returns true if contains only alphanumeric characters,
	// underscores and/or dashes.
	function isUsername(username) {
		var re = /^[a-zA-Z0-9-_]+$/;
		return re.test(username);
	}

	/*
	Res Data:
		code 	= int
		message = string
		token 	= string
		ttl		= number
	*/
	function createAccount(req, res) {
		var username	= validator.toString(validator.escape(req.body.username));
		var password	= validator.toString(validator.escape(req.body.password));
		var email		= validator.toString(validator.escape(req.body.email));

		// Captcha key

		/////////////////////
		// USERNAME CHECKS //
		/////////////////////

		// Checks empty username field
		if (!username) {
			res.send({
				code 	: 400,
				message : 'Username field is required.'
			});
			return;
		}

		// Validate username (alphanumeric characters, underscore and/or dashes)
		if (!isUsername(username)) {
			res.send({
				code 	: 400,
				message : 'Username can only contain alphanumeric characters, ' +
						  'underscores, and/or dashes.'
			});
			return;
		}

		// TODO: Decide min and max
		// Check username length
		if (!validator.isLength(username, 4, 12)) {
			res.send({
				code	: 400,
				message : 'Username must be between 4 and 12 characters.'
			});
			return;
		}

		/////////////////////
		// PASSWORD CHECKS //
		/////////////////////

		// Checks empty password field
		if (!password) {
			res.send({
				code 	: 400,
				message : 'Password field is required.'
			});
			return;
		}

		// Check is valid password (must contain at least one letter and number)
		
		// TODO: define min and max
		// Check password length
		if (!validator.isLength(password, 4, 512)) {
			res.send({
				code	: 400,
				message : 'Password must be between 5 and 512 characters.'
			});
			return;
		}

		//////////////////
		// EMAIL CHECKS //
		//////////////////

		// Validate email
		if (!validator.isEmail(email)) {
			res.send({
				code	: 400,
				message : 'Not a valid email address.'
			});
			return;
		}

		// TODO: define min and max
		// Check email length
		if (!validator.isLength(email, 4, 512)) {
			res.send({
				code	: 400,
				message : 'Email must be between 4 and 512 characters long.'
			});
			return;
		}
		
		// TODO: Generate tokens
		User.create(username, password, email, function(err, user) {
			if (err) {
				res.send(err);
				return;
			}
			res.send({
				code	: 200,
				message	: 'Account successfully created.'
				// token?
				// ttl?
			});
		});
	}

	/*
	Res Data:
		code 	= int
		message = string
	*/
	function deleteAccount(req, res) {
		var token = req.body.token;

		User.delete(function(err) {
			if (err) {
				res.send(err);
				return;
			}
			res.send({
				code	: 200,
				message	: 'Account successfully deleted.'
			});
		});
	}

	/*
	Res Data:
		code 	= int
		message = string
	*/
	function changePassword(req, res) {
		var token 			= req.body.token;
		var oldPassword 	= validator.toString(validator.escape(req.body.oldPassword));
		var newPassword 	= validator.toString(validator.escape(req.body.newPassword));

		User.changePassword(function(err) {
			if (err) {
				res.send(err);
				return;
			} 
			res.send({
				code	: 200,
				message	: 'Password has been changed.'
			});
		});
		
	}

	/*
	Res Data:
		code 	= int
		message = string
		token 	= string
		ttl		= number
	*/
	function authenticate(req, res) {
		var usernameEmail 	= validator.toString(validator.escape(req.body.usernameemail));
		var password 		= validator.toString(validator.escape(req.body.password));

		if (!usernameEmail) {
			res.send({
				code	: 400,
				message	: 'Username/Email field is required.'
			});
		}

		// TODO: Decide on min and max
		// Check usernameEmail length
		if (!validator.isLength(usernameEmail, 4, 512)) {
			res.send({
				code	: 400,
				message : 'Username/Email must be between 5 and 512 characters.'
			});
			return;
		}

		if (!password) {
			res.send({
				code 	: 400,
				message : 'Password field is required.'
			});
			return;
		}

		// TODO: Decide on min and max
		// Check password length
		if (!validator.isLength(password, 4, 512)) {
			res.send({
				code	: 400,
				message : 'Password must be between 5 and 512 characters.'
			});
			return;
		}

		User.login(usernameEmail, password, function(err, user) {
			if (err) {
				res.send(err);
				return;
			}
			res.send({
				code	: 200,
				message	: 'Login successful.'
				// token?
				// ttl?
			});
		});
	}

	/*
	Res Data:
		code 	= int
		message = string
		token 	= string
		ttl		= number
	*/
	function reauthenticate(req, res) {
		var token = req.body.token;

		// TDOD: Method in user model to renew token if it's already in the database.
	}

	/*
	Res Data:
		code 	= int
		message = string
	*/
	function logout(req, res) {
		var token = req.body.token;

		// TODO: Method in user model to remove token if it's in the database.
	}

	app.post('/v1/user', createAccount);
	app.delete('/v1/user', deleteAccount);
	app.put('/v1/user/password', changePassword);
	app.post('/v1/user/authenticate', authenticate);
	app.post('/v1/user/reauthenticate', reauthenticate);
	app.post('/v1/user/logout', logout);
}