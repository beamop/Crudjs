var mongoose = require('mongoose');

// news schema
var NewsSchema = mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    content: {
        type: String
    },
    date: { type: Date, default: Date.now }
})

var News = module.exports = mongoose.model('News', NewsSchema);

module.exports.createNews = function(newNews, callback) {
    newNews.save(callback);
};

module.exports.getNewsById = function(id, callback) {
    News.findById(id, callback);
};