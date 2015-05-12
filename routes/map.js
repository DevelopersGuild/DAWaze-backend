'use strict';

module.exports = function(app) {
  var validator = require('validator');
  var Tag       = require('../models/tags');

  function newTag(req, res) {
    var token = validator.toString(validator.escape(req.body.token));
    var title = validator.toString(validator.escape(req.body.title));
    var lat   = validator.toString(validator.escape(req.body.lat));
    var lon   = validator.toString(validator.escape(req.body.lon));
    var tag   = req.body.tag;
    var user  = req.body.user;
    var ttl   = req.body.ttl;

    //////////////////
    // TITLE CHECKS //
    //////////////////

    // Checks empty title field
    if (!title) {
      res.send({
        code    : 400,
        message : "Title field is required."
      });
      return;
    }

    // TODO: Decide on title length
    // Checks title length
    if (!validator.isLength(title, 5, 512)) {
      res.send({
        code    : 400,
        message : "Title must be between 5 and 512 characters."
      })
    }

    // Check for vulgarness??? (Profanity Util)

    ///////////////////////
    // COORDINATE CHECKS //
    ///////////////////////

    // Checks empty latitude field
    if (!lat) {
      res.send({
        code    : 400,
        message : "Latitude field is required."
      });
      return;
    }

    // Valid latitude checks

    // Checks empty longitude field
    if (!lon) {
      res.send({
        code    : 400,
        message : "Longitude field is required."
      });
      return;
    }

    // Valid logitude checks

    ///////////////////////////////////////

    // Check user/ownwer id?

    // Check if valid ttl

    Tag.create(token, title, lat, lon, tag, user, ttl, function (err, tag) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : "Tag successfully created",
        tag     : tag
      });
    });
  }

  function deleteTag(req, res) {
    var token = req.body.token;

    // Any checks??

    Tag.delete(function(err) {
      if (err) {
        res.send(err);
        return;
      }
      res.send({
        code    : 200,
        message : "Tag successfully deleted"
      });
    });
  }

  // What is the structure of this method?
  // app.get('/v1/map', getTag);

  app.post('/v1/map/tag', newTag);
  app.delete('/v1/map/tag', deleteTag);
}
