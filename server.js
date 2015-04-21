'use strict';

var bodyParser    = require('body-parser');
var express       = require('express');
var path          = require('path');

// Use middleware
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var SERVER_ADDRESS = process.env.SERVER_ADDRESS || 'localhost';
var SERVER_PORT = process.env.SERVER_PORT || 9000;

// Handle 404 Error
app.use(function(req, res, next) {
  res.send('Not Found');
});


var server = app.listen(SERVER_PORT, SERVER_ADDRESS, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Daze Backend API listening at http://%s:%s in %s mode.',
    host, port, app.get('env'));
});
