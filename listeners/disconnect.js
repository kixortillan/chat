var User = require('../models/user');

module.exports = function(socket, io) {

	socket.on('disconnect', function(data) {

		console.log('disconnecting...', data);
		
		User.remove({ socketId: socket.id })
		.then(function() {
			
			console.log('A user has disconnected...');

			return User.find().exec();

		})
		.then(function(users) {
			
			io.emit('users-connected', {users: users});

		});

	});

}