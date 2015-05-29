'use strict';

module.exports = function(app) {
  var Validator = require('../models/shallow-validator');
  var Marker    = require('../models/markers');

  function fetchMap(req, res) {
    Marker.getAll(function(err, markers) {
      if (err) {
        res.send(err);
      } else {
        res.send({
          code: 200,
          message: 'Here are all the markers.',
          markers: markers
        });
      }
    });
  }

  function newMarker(req, res) {
    var token     = req.body.token;
    var title     = req.body.title;
    var location  = req.body.location;
    var lat       = parseInt(req.body.lat, 10);
    var lon       = parseInt(req.body.lon, 10);
    var type      = parseInt(req.body.type, 10);
    var ttl       = parseInt(req.body.ttl, 10);

    if (Validator.sendError(res, Validator.token(token))) { return; }
    if (Validator.sendError(res, Validator.title(title))) { return; }
    if (Validator.sendError(res, Validator.location(location))) { return; }
    if (Validator.sendError(res, Validator.coordinate(lat))) { return; }
    if (Validator.sendError(res, Validator.coordinate(lon))) { return; }
    if (Validator.sendError(res, Validator.type(type))) { return; }
    if (Validator.sendError(res, Validator.ttl(ttl))) { return; }

    Marker.create(token, title, location, lat, lon, type, ttl,
      function (err, marker) {
        if (err) {
          res.send(err);
          return;
        }

        res.send({
          code    : 200,
          message : 'Marker successfully created',
          marker  : marker
        });
      }
    );
  }

  function deleteMarker(req, res) {
    var token = req.body.token;

    if (Validator.sendError(res, Validator.token(token))) { return; }

    // Any checks??

    Marker.delete(function(err) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : 'Marker successfully deleted'
      });
    });
  }

  // What is the structure of this method?
  //
  app.get('/v1/map', fetchMap);
  app.post('/v1/map/marker', newMarker);

  // Not in the API specs
  // app.delete('/v1/map/marker', deleteMarker);
};
