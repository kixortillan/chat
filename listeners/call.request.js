module.exports = function(socket, io) {

    socket.on('call-request', function(data) {

        console.log('calling...', data);

        io.emit('call-request', data);

    });

}