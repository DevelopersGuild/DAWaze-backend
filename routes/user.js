'use strict';

module.exports = function(app) {

	var validator = require('validator');
	var User = require('/.././models/user');

	// Returns true if contains only alphanumeric characters,
	// underscores and/or dashes.
	var isUsername = function isUsername(username) {
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
	var createAccount = function createAccount(req, res) {
		var username	= validator.toString(validator.escape(req.body.username));
		var password	= validator.toString(validator.escape(req.body.password));
		var email		= validator.toString(validator.escape(req.body.email));

		// Captcha key

		/////////////////////
		// USERNAME CHECKS //
		/////////////////////

		if (!username) {
			res.send({
				code 	: 400,
				message : 'Username field is required.'
			});
			return;
		}

		// Check username already exists
		/*
		if (req.session.user) {
			error = {
				code 	: 400,
				message : '..........'
			};
			res.send(error);
			return;
		}
		*/

		if (!isUsername(username)) {
			res.send({
				code 	: 400,
				message : 'Username can only contain alphanumeric characters, ' +
						  'underscores, and/or dashes.'
			});
			return;
		}

		// TODO: define min and max
		// Check username length
		if (!validator.isLength(username, min, max)) {
			res.send({
				code	: 400,
				message : 'Username must be between min and max characters.'
			});
			return;
		}

		/////////////////////
		// PASSWORD CHECKS //
		/////////////////////

		// TODO: Confirm Password?

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
		if (!validator.isLength(password, min, max)) {
			res.send({
				code	: 400,
				message : 'Password must be between min and max characters.'
			});
			return;
		}

		//////////////////
		// EMAIL CHECKS //
		//////////////////

		// TODO: Is this check neccessary?
		// Check email field
		if (!email) {
			res.send({
				code 	: 400,
				message : 'Email field is required.'
			});
			return;
		}

		// Check email already exists

		if (!validator.isEmail(email)) {
			res.send({
				code	: 400,
				message : 'Not a valid email address.'
			});
			return;
		}

		// TODO: define min and max
		// Check email length
		if (!validator.isLength(email, min, max)) {
			res.send({
				code	: 400,
				message : 'Email must be between min and max characters long.'
			});
			return;
		}

		User.create(username, password, email, function(err, user) {
			if (err) {
				res.send(err);
				return;
			}
			User.setOnlineStatus(user.username, true, function(err) {
				if (err) {
					res.send(err);
					return;
				}
				req.session.user = user;

				// TODO: Decide session expiration time and change var time
				// Cookie expiration time
				var time;
				
				req.session.cookie.expires = new Date(Date.now() + time);
				
				res.send({
					code	: 200,
					message	: 'Account successfully created.'
					// token?
					// ttl?
				});

				// Redirect?
			});
		});
	}

	/*
	Res Data:
		code 	= int
		message = string
	*/
	var deleteAccount = function deleteAccount(req, res) {
		// var token = req.body.token;

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
	var changePassword = function changePassword(req, res) {
		// var token 			= req.body.token;
		var oldPassword 	= validator.toString(validator.escape(req.body.oldPassword));
		var newPassword 	= validator.toString(validator.escape(req.body.newPassword));
		var confirmPassword = validator.toString(validator.escape(req.body.confirmPassword));
		var user 			= req.session.user;

		if (newPassword != confirmPassword) {
			res.send({
				code	: 400,
				message	: 'Passwords must match.'
			});
			return;
		}
		
		// Cryptography??
		if (oldPassword != user.password) {
			res.send({
				code	: 400,
				message : 'Incorrect password.'
			});
			return;
		}

		User.changePassword(function(err) {
			if (err) {
				res.send(err);
				return;
			} 
			res.send({
				code	: 200,
				message	: 'Password has been changed.'
			});
		};
	}

	/*
	Res Data:
		code 	= int
		message = string
		token 	= string
		ttl		= number
	*/
	var authenticate = function authenticate(req, res) {
		var usenameEmail 	= validator.toString(validator.escape(req.body.usernameemail));
		var password 		= validator.toString(validator.escape(req.body.password));

		// TODO: Isn't a redirect more appropriate?
		// Check if user already logged in
		if (req.session.user) {
			res.send({
				code	: 400
				message	: 'User already online.'
			});
			return;
		}

		if (!usernameEmail) {
			res.send({
				code	: 400
				message	: 'Username/Email field is required.'
			});
		}

		// Check usernameEmail length
		// Check id exists (either username or email) ??

		if (!password) {
			res.send({
				code 	: 400,
				message : 'Password field is required.'
			});
			return;
		}

		// Check password length
		// Validate password ??

		User.login(usernameEmail, password, function(err, user) {
			if (err) {
				res.send(err);
				return;
			}
			User.setOnlineStatus(user.username, true, function(err) {
				if (err) {
					res.send(err);
					return;
				}
				req.session.user = user;

				// TODO: Decide session expiration time and change var time
				// Cookie expiration time
				var time;
				
				req.session.cookie.expires = new Date(Date.now() + time);
				
				res.send({
					code	: 200,
					message	: 'Login successful.'
					// token?
					// ttl?
				});

				// Redirect??
			})
		});
	}

	/*
	Res Data:
		code 	= int
		message = string
		token 	= string
		ttl		= number
	*/
	var reauthenticate = function reauthenticate(req, res) {
		var token = req.body.token;

		// ?????
	}

	/*
	Res Data:
		code 	= int
		message = string
	*/
	var logout = function logout(req, res) {

		if (!req.session.user) {
			res.send({
				code	: 400,
				message	: 'User not logged in.'
			});
			return;
		}

		User.setOnlineStatus(user.username, false, function(err) {
			if (err) {
				res.send(err);
				return;
			}
			req.session.destroy(function(err) {
				if (err) {
					res.send(err);
					return;
				}
				res.send({
					code	: 200,
					message	: 'Logout successful.'
				});

				// Redirect
			});		
		});
	}

	app.post('/v1/user', createAccount);
	app.delete('/v1/user', deleteAccount);

	// '/v1/user/:userid/password'?
	app.put('/v1/user/password', changePassword);

	app.post('/v1/user/authenticate', authenticate);

	app.post('/v1/user/reauthenticate', reauthenticate);

	app.post('/v1/user/logout', logout);

	
}