var db = require('../lib/chatterdb');
var User = require('../models/user');

module.exports = function(socket, io) {

    socket.on('join', function(data) {

        console.log('joining...', data);

        User.findOne({ username: data.username })
            .then(function(user) {

                if (user) {
                		console.log('User already existing...');
                    io.emit('user-exist', 'This username is already taken.');
                    return Promise.reject('Already existing');
                }

                var newUser = new User({
                    socketId: socket.id,
                    username: data.username,
                });

                return newUser.save();
            })
            .then(function(doc) {

                //saving new user successful
                console.log('New user created...', doc);

                return User.find().exec();

            })
            .then(function(users) {

                console.log(users);
                io.emit('users-connected', { users: users });

            })
            .catch(function(err) {
            	console.log(err);
            });

    });

}