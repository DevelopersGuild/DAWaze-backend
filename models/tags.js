'use strict';

var Db       = require('../config/database');
var mongoose = require('mongoose');

var TagSchema = mongoose.Schema({
    title          : {type: String, required: true},
    location       : {type: String, required: true},
    coordinates: {
        lat        : {type: Number, required: true},
        lon        : {type: Number, required: true}
    },
    tag            : {type: String, required: true},
    owner          : {type: String, required: true},
    createdAt      : {type: Date  , default : Date.now},
    expires        : {type: Date  , required: true},
    score          : {type: Number, default : 0}
});

var TagMongoModel = Db.model('tags', TagSchema);

function createTag(title, loc, lat, lon, tag, owner, ttl, callback) {
    var newTag = {
        title          : title,
        location       : loc,
        coordinates: {
            lat        : lat,
            lon        : lon
        },
        tag            : tag,
        owner          : owner,
        expirationDate : Date.now() + ttl  // How to set expiration time in the DB?
    }

    TagMongoModel.create(newTag, function(err, tag) {
        callback(err, tag);
    });
}

var TagModel = {
    create: createTag

    // TODO: getTag??
};

module.exports = TagModel;
