'use strict';

var validator = require('validator');

var USERNAME_MIN_LEN  = 3;
var USERNAME_MAX_LEN  = 20;
var EMAIL_MAX_LEN     = 254;
var PASSWORD_MIN_LEN  = 5;
var PASSWORD_MAX_LEN  = 512;


function validateToken(token) {
  var tokenRegexp = /^[A-Za-z0-9+\/]{342}==$/;

  if (!token) {
    return new Error('You are not logged in.');
  }
  if (!tokenRegexp.test(token)) {
    return new Error('That token is invalid.');
  }
  return null;
}


function validateUsername(username) {
  var usernameRegexp = /^[a-zA-Z0-9-_]+$/;

  if (!username) {
    return new Error('Username field cannot be empty.');
  }

  if (!validator.isLength(username, USERNAME_MIN_LEN)) {
    return new Error('Username must be at least ' +
      USERNAME_MIN_LEN + ' characters.');
  }

  if (validator.isLength(username, USERNAME_MAX_LEN + 1)) {
    return new Error('Username field cannot be more than ' +
      USERNAME_MAX_LEN + ' characters.');
  }


  if (!usernameRegexp.test(username)) {
    return new Error('Username can only contain letters, ' +
                    'numbers, dashes, and underscores.');
  }

  return null;
}

function validateEmail(email) {

  if (!email) {
    return new Error('Email field cannot be empty.');
  }

  if (!validator.isEmail(email)) {
    return new Error('That is not a valid email.');
  }

  if (validator.isLength(email, EMAIL_MAX_LEN + 1)) {
    return new Error('Email is too long.');
  }

  return null;

}

function validatePassword(password) {
  if (!password) {
    return new Error('Password field cannot be empty.');
  }

  if (!validator.isLength(password, PASSWORD_MIN_LEN)) {
    return new Error('Password must be at least ' +
      PASSWORD_MIN_LEN + ' characters.');
  }

  if (validator.isLength(password, PASSWORD_MAX_LEN + 1)) {
    return new Error('Password is too long.');
  }

  return null;

}

function validateUsernameEmail(usernameEmail) {

  if (!usernameEmail) {
    return new Error('Username/Email field cannot be empty.');
  }

  // Whichever is greater.
  var maxLen = Math.max(EMAIL_MAX_LEN, USERNAME_MAX_LEN) + 1;
  if (validator.isLength(usernameEmail, maxLen + 1)) {

    return new Error('Username/Email is too long.');
  }

  return null;
}


var ShallowValidateModel = {
  username      : validateUsername,
  email         : validateEmail,
  password      : validatePassword,
  usernameEmail : validateUsernameEmail,
  token         : validateToken
};

module.exports = ShallowValidateModel;
