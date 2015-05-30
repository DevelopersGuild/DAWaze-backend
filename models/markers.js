'use strict';

var Db       = require('../config/database');
var async     = require('async');
var mongoose = require('mongoose');

var Session = require('./sessions');
var TTL = 604800000;

var ObjectId  = mongoose.Schema.ObjectId;

// Create the schema for a marker
var MarkerSchema = mongoose.Schema({
  title       : {type: String, required: true},
  description : {type: String, required: true},
  location    : {type: String, required: true},
  coordinates : {
    lat       : {type: Number, required: true},
    lon       : {type: Number, required: true}
  },
  type        : {type: Number, required: true},
  owner       : {type: ObjectId, required: true},
  createdAt   : {type: Date, expires: 2}
});

// Creates a collection named marker in MongoDB
var MarkerMongoModel = Db.model('markers', MarkerSchema);

// Creates a new marker with required indexes.
function createMarker(token, title, description, location,
                      type, lat, lon, ttl, callback) {
  async.waterfall([function(next) {
    Session.findUser(token, next);
  }, function(userId, next) {
    //console.log(date.getTime());
    MarkerMongoModel.create({
      title       : title,
      description : description,
      location    : location,
      coordinates : {
        lat       : lat,
        lon       : lon
      },
      type        : type,
      owner       : userId
    }, next);
  }], function(err, marker) {
    if (err) {
      callback(err);
    } else {
      var callbackMarker = {
        id          : marker._id,
        title       : marker.title,
        description : marker.description,
        location    : marker.location,
        type        : marker.type,
       // ttl         : marker.createdAt,
        lat         : marker.coordinates.lat,
        lon         : marker.coordinates.lon
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
          id          : marker._id,
          title       : marker.title,
          description : marker.description,
          location    : marker.location,
          type        : marker.type,
          //ttl         : marker.createdAt.expires,
          lat         : marker.coordinates.lat,
          lon         : marker.coordinates.lon
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
