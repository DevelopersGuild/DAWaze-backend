'use strict';

var Db = require('/../config/database');

var TagSchema = mongoose.Schema({
    title           : {type: String, required: true},
    coordinates: {
        lat         : {type: Number, required: true},
        lon         : {type: Number, required: true}
    },
    tag             : {type: String, required: true},
    owner           : {type: String, required: true},
    creationDate    : {type: Date  , default : Date.now},
    expirationDate  : {type: Date  , required: true},
    score           : {type: Number, default : 0}
});

var TagMongoModel = Db.model('tags', TagSchema);

function createTag(title, lat, lon, tag, owner, ttl, callback) {
    var newTag = {
        title           : title,
        coordinates: {
            lat         : lat,
            lon         : lon
        },
        tag             : tag,
        owner           : owner,
        expirationDate  : Date.now() + ttl  // How to set expiration time in the DB?
    }

    TagMongoModel.create(newTag, function(err, tag) {
        callback(err, tag);
    });
}

var TagModel = {
    create: createTag,
    delete: deleteTag

    // TODO: getTag??
};

module.exports = TagModel;
