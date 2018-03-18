module.exports = function(io) {

	io.on('connection', function(socket) {
		
		console.log('user connected...');

		require('./join')(socket, io);
		require('./disconnect')(socket, io);
		require('./call.request')(socket, io);
		require('./call.accept')(socket, io);
		require('./ice')(socket, io);

	});

}