'use strict';

module.exports = function(app) {
  var validator = require('validator');
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
    var lat       = parseInt(req.body.lat,10);
    var lon       = parseInt(req.body.lon, 10);
    var ttl       = parseInt(req.body.ttl, 10);

    //////////////////
    // TITLE CHECKS //
    //////////////////

    // Checks empty title field
    if (!title) {
      res.send({
        code    : 400,
        message : 'Title field is required.'
      });
      return;
    }

    // TODO: Decide on title length
    // Checks title length
    if (!validator.isLength(title, 5, 512)) {
      res.send({
        code    : 400,
        message : 'Title must be between 5 and 512 characters.'
      });
    }

    // Check for vulgarness??? (Profanity Util)

    ///////////////////////
    // COORDINATE CHECKS //
    ///////////////////////

    // Checks empty latitude field
    if (!lat) {
      res.send({
        code    : 400,
        message : 'Latitude field is required.'
      });
      return;
    }

    // Valid latitude checks

    // Checks empty longitude field
    if (!lon) {
      res.send({
        code    : 400,
        message : 'Longitude field is required.'
      });
      return;
    }

    // Valid logitude checks

    ///////////////////////////////////////

    // Check user/ownwer id?

    // Check if valid ttl

    Marker.create(token, title, location, lat, lon, ttl,
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
  app.delete('/v1/map/marker', deleteMarker);
};
