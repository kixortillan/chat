module.exports = function(socket, io) {

    socket.on('call-accept', function(data) {

        console.log('accepting...', data);

        io.emit('call-accept', data);

    });

}