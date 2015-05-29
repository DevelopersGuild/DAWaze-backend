'use strict';

var Db       = require('../config/database');
var async     = require('async');
var mongoose = require('mongoose');

var Session = require('./sessions');
var TTL = 604800000;

var ObjectId  = mongoose.Schema.ObjectId;

// Create the schema for a marker
var MarkerSchema = mongoose.Schema({

  // Title of the marker
  title       : {type: String, required: true},

  // Description for the marker
  description : {type: String, required: true},

  // Location of the marker in terms of DeAnza building and room #
  location    : {type: String, required: true},

  // Coordinates of the location
  coordinates : {
    lat       : {type: Number, required: true},
    lon       : {type: Number, required: true}
  },

  // Type of the marker
  type        : {type: Number, required true},

  // Username of owner of the marker
  owner       : {type: ObjectId, required: true},

  // Creation date defaults to Date.now()
  createdAt   : {type: Date, default: Date.now},

  // Expiration set to Date.now() + TTL
  expireAt    : {type: Date, required: true, expireAfterSeconds: 0}
});

// Creates a collection named marker in MongoDB
var MarkerMongoModel = Db.model('markers', MarkerSchema);

// Creates a new marker with required indexes.
function createMarker(token, title, location, type, lat, lon, ttl, callback) {
  async.waterfall([function(next) {
    Session.findUser(token, next);
  }, function(userId, next) {
    //console.log(date.getTime());
    MarkerMongoModel.create({
      title       : title,
      location    : location,
      coordinates : {
        lat       : lat,
        lon       : lon
      },
      type        : type,
      owner       : userId,
      expireAt    : Date.now() + ttl
    }, next);
  }], function(err, marker) {
    if (err) {
      callback(err);
    } else {
      var callbackMarker = {
        id       : marker._id,
        title    : marker.title,
        location : marker.location,
        type     : marker.type,
        ttl      : marker.expireAt - Date.now(),
        lat      : marker.coordinates.lat,
        lon      : marker.coordinates.lon
      };
      callback(err, callbackMarker);
    }
  });

}

function getAllMarkers(callback) {
  MarkerMongoModel.find({}, function(err, markers) {
    if (err) {
      callback(err);
    } else {
      var callbackMarkers = markers.map(function(marker) {
        return {
          id       : marker._id,
          title    : marker.title,
          location : marker.location,
          type     : marker.type,
          ttl      : marker.expireAt - Date.now(),
          lat      : marker.coordinates.lat,
          lon      : marker.coordinates.lon
        };
      });
      callback(null, callbackMarkers);
    }
  });
}

function removeAllMarkers(userId, callback) {
  MarkerMongoModel.remove({ owner : userId }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

var MarkerModel = {
  create: createMarker,
  getAll: getAllMarkers,
  removeAll: removeAllMarkers
};

module.exports = MarkerModel;
