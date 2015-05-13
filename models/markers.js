'use strict';

var Db       = require('../config/database');
var mongoose = require('mongoose');

// Create the schema for a tag
var MarkerSchema = mongoose.Schema({

  // Title of the tag
  title       : {type: String, required: true},

  // Location of the tag in terms of DeAnza building and room #
  location    : {type: String, required: true},

  // Coordinates of the location
  coordinates : {
    lat       : {type: Number, required: true},
    lon       : {type: Number, required: true}
  },

  // Preset tags
  tag         : {type: String, required: true},

  // Username of owner of the tag
  owner       : {type: String, required: true},

  // Creation date defaults to Date.now()
  createdAt   : {type: Date  , default : Date.now},

  // Expiration set to Date.now() + TTL
  expireAt    : {type: Date  , required: true, expireAfterSeconds: 0 },

  // TODO: What is score???
  score       : {type: Number, default : 0}
});

// Creates a collection named tags in MongoDB
var MarkerMongoModel = Db.model('tags', MarkerSchema);

// Creates a new tag with required indexes.
function createMarker(title, loc, lat, lon, tag, owner, ttl, callback) {

  // TODO: Check for identical markers?
  var newTag = new MarkerMongoModel({
    title       : title,
    location    : loc,
    coordinates : {
      lat       : lat,
      lon       : lon
    },
    tag         : tag,
    owner       : owner,
    expireAt    : Date.now() + ttl
  });

  newTag.save(function(err, tag) {
    if (err) {
      callback(err);
      return;
    }
      callback(null, tag);
  });
}

var MarkerModel = {
  create: createMarker
  // TODO: getTag??
};

module.exports = MarkerModel;
