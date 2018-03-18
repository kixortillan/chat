var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatter');
mongoose.connection.on('open', function() {
	console.log('Connected to mongodb...');
});
mongoose.connection.on('error', function(err) {
	console.error('Cannot connect to mongodb...', err);
});

module.exports = mongoose.connection;