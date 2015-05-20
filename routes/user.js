'use strict';

module.exports = function(app) {
  var validator = require('validator');
  var User      = require('../models/users');

  // Returns true if contains only alphanumeric characters,
  // underscores and/or dashes.
  function isUsername(username) {
    var regEx = /^[a-zA-Z0-9-_]+$/;
    return regEx.test(username);
  }

  function createAccount(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email    = req.body.email;

    // Captcha key

    /////////////////////
    // USERNAME CHECKS //
    /////////////////////

    // Checks empty username field
    if (!username) {
      res.send({
        code    : 400,
        message : 'Username field is required.'
      });
      return;
    }

    // Validate username (alphanumeric characters, underscore and/or dashes)
    if (!isUsername(username)) {
      res.send({
        code    : 400,
        message : 'Username can only contain alphanumeric characters, ' +
        'underscores, and/or dashes.'
      });
      return;
    }

    // TODO: Decide min and max
    // Check username length
    if (!validator.isLength(username, 4, 12)) {
      res.send({
        code    : 400,
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
        code    : 400,
        message : 'Password field is required.'
      });
      return;
    }

    // Check is valid password (must contain at least one letter and number)

    // TODO: define min and max
    // Check password length
    if (!validator.isLength(password, 4, 512)) {
      res.send({
        code    : 400,
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
        code    : 400,
        message : 'Not a valid email address.'
      });
      return;
    }

    // TODO: define min and max
    // Check email length
    if (!validator.isLength(email, 4, 512)) {
      res.send({
        code    : 400,
        message : 'Email must be between 4 and 512 characters long.'
      });
      return;
    }

    User.create(username, password, email, function(err, session) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Account successfully created.',
        token   : session.token,
        ttl     : session.expireAt - Date.now()
      });
    });
  }

  function deleteAccount(req, res) {
    var clientToken = req.body.token;

    User.delete(clientToken, function(err) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Account successfully deleted.'
      });
    });
  }

  function changePassword(req, res) {
    var clientToken = req.body.token;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;

    User.changePassword(clientToken, oldPassword, newPassword, function(err) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Password has been changed.'
      });
    });
  }

  function authenticate(req, res) {
    var usernameEmail = req.body.usernameEmail;
    var password      = req.body.password;

    if (!usernameEmail) {
      res.send({
        code    : 400,
        message : 'Username/Email field is required.'
      });
      return;
    }

    // TODO: Decide on min and max
    // Check usernameEmail length
    if (!validator.isLength(usernameEmail, 4, 512)) {
      res.send({
        code    : 400,
        message : 'Username/Email must be between 5 and 512 characters.'
      });
      return;
    }

    if (!password) {
      res.send({
        code    : 400,
        message : 'Password field is required.'
      });
      return;
    }

    // TODO: Decide on min and max
    // Check password length
    if (!validator.isLength(password, 4, 512)) {
      res.send({
        code    : 400,
        message : 'Password must be between 5 and 512 characters.'
      });
      return;
    }

    User.login(usernameEmail, password, function(err, session) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Login successful.',
        token   : session.token,
        ttl     : session.expireAt - Date.now()
      });
    });
  }

  function reauthenticate(req, res) {
    var clientToken = req.body.token;
    User.reauthenticate(clientToken, function(err, session) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Session successfully refreshed.',
        token   : session.token,
        ttl     : session.expireAt - Date.now()
      });
    });
  }

  function logout(req, res) {
    var clientToken = req.body.token;
    User.logout(clientToken, function(err) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Logout successful.'
      });
    });
  }

  app.post('/v1/user', createAccount);
  app.delete('/v1/user', deleteAccount);
  app.put('/v1/user/password', changePassword);
  app.post('/v1/user/authenticate', authenticate);
  app.post('/v1/user/reauthenticate', reauthenticate);
  app.post('/v1/user/logout', logout);
};
