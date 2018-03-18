var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var schema = new mongoose.Schema({
	socketId: String,
	username: String,
});

module.exports = mongoose.model('User', schema);