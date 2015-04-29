'use strict';

var mongoose = require('mongoose');

var Db = require('.././config/database');

var TagSchema = mongoose.Schema({
  title: {type: String , required: true},
  coordinates: {
    lat: {type: Number, required: true},
    long: {type: Number, required: true}
  },
  tag: {type: String, required: true},
  owner: {type: String, required: true},
  creationDate: {type: Date, default: Date.now},
  expirationDate: {type: Date, required: true},
  score: {type: Number, default: 0}

});

var TagMongoModel = Db.model('tags', TagSchema);

function createExpirationDate(ttl) {
  return (Date.now() + ttl);
}

function createTag(title, lat, long, tag, owner, ttl, callback) {
  TagMongoModel.create({
    title: title,
    coordinates: {
      lat: lat,
      long: long
    },
    tag: tag,
    owner: owner,
    expirationDate: createExpirationDate(ttl)
  }, function(err, tag) {
    callback(err);
  });
}

var TagModel = {
  create: createTag
};

module.exports = TagModel;
