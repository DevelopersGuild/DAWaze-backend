'use strict';

module.exports = function(app) {
  var Validator = require('../models/shallow-validator');
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

    if (Validator.sendError(res, Validator.username(username))) { return; }
    if (Validator.sendError(res, Validator.password(password))) { return; }
    if (Validator.sendError(res, Validator.email(email))) { return; }


    User.create(username, password, email, function(err, session) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Account successfully created.',
        token   : session.token,
        ttl     : session.expirationDate - Date.now()
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

    if (Validator.sendError(res, Validator.token(clientToken))) { return; }
    if (Validator.sendError(res, Validator.password(oldPassword))) { return; }
    if (Validator.sendError(res, Validator.password(newPassword))) { return; }

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

    if (Validator.sendError(res, Validator.usernameEmail(usernameEmail))) { return; }
    if (Validator.sendError(res, Validator.password(password))) { return; }

    User.login(usernameEmail, password, function(err, session) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Login successful.',
        token   : session.token,
        ttl     : session.expirationDate - Date.now()
      });
    });
  }

  function reauthenticate(req, res) {
    var clientToken = req.body.token;

    if (Validator.sendError(res, Validator.token(clientToken))) { return; }

    User.reauthenticate(clientToken, function(err, session) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Session successfully refreshed.',
        token   : session.token,
        ttl     : session.expirationDate - Date.now()
      });
    });
  }

  function logout(req, res) {
    var clientToken = req.body.token;

    if (Validator.sendError(res, Validator.token(clientToken))) { return; }
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
