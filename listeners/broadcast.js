module.exports = function(socket) {

	socket.on('broadcast', function(data) {

		console.log('broadcasting...', data);

	});

}