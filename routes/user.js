'use strict';

module.exports = function(app) {

	// var User = require('.././models/user')
	// User.create(username, pw, email, function(err) {

	// })
	// Create account function

	function createAccount(req, res) {
		var username	= req.body.username;
		var password	= req.body.password;
		var email		= req.body.email;

		// Captcha key

		// Check username exists
		// Check is valid username
		// Check username length

		// Check password length

		// Check is valid email
		// Check email length

		/*
		User.create(username, password, email, function(err, user) {
			if (err) {
				
				// Do stuff
				return;
			}

			// Set cookies
			// Logon???
			// Redirect
		});
		*/
	}

	function deleteAccount(req, res) {
		// What is a token?????
		var token = req.body.token;

		/*
		User.delete(function(err) {
			if (err) {
				
				// Do stuff
				return;
			}

			// Success!
			// Redirect
		});
		*/
	}

	function changePassword(req, res) {
		var token = req.body.token;
		var oldPassword = req.body.oldPassword;
		var newPassword = req.body.newPassword;
		var confirmPassword = req.body.confirmPassword;

		if (newPassword != confirmPassword) {

			// flash not matching
		} else {

			// Validate oldPassword

			/*
			User.changePassword(function(err) {
				if (err) {
					
					// Do stuff
					return;
				} 

				// Success!
				// Redirect
			};
			*/
		}
	}

	function authenticate(req, res) {
		var usenameEmail = req.body.usernameemail;
		var password = req.body.password;

		// Check if user already logged in

		// Check if usernameEmail field is empty
		// Check usernameEmail length
		// Check id exists (either username or email) ??

		// Check if password field is empty
		// Check password length
		// Validate password ??

		/*
		User.login(id, password, function(err, user) {
			if (err) {
				
				// Do stuff
				return;
			}
			User.setOnlineStatus(user.username, true, function(err) {
				if (err) {
					
					// Do stuff
					return;
				}

				// Acquire session cookie
				// Redirect
			})
		});
		*/
	}

	function reauthenticate(req, res) {
		var token = req.body.token;

		// ?????
	}

	function logout(req, res) {

		// Check if user logged in already

		/*
		User.setOnlineStatus(user.username, false, function(err) {
				if (err) {

					// Do stuff
					return;
				}

				// Destroy session
				// Redirect
		*/
	}

	app.post('/v1/user', createAccount);
	app.delete('/v1/user', deleteAccount);

	app.put('/v1/user/password', changePassword);

	app.post('/v1/user/authenticate', authenticate);

	app.post('/v1/user/reauthenticate', reauthenticate);

	app.post('/v1/user/logout', logout);

	
}