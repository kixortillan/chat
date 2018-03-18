module.exports = function(socket, io) {

    socket.on('add-icecandidate', function(data) {

        console.log('adding ice candidate...', data);

        io.emit('add-icecandidate', data);

    });

}