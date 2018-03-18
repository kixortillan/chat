var localVideo = document.querySelector('#video_local');
var remoteVideo = document.querySelector('#video_remote');
var peerConnection;
var localDesc;
var localStream;
var hasAddTrack;
var mediaConstraints = {
    audio: true,
    video: {
        facingMode: 'user',
    },
};

function gotStream(localStream) {
    console.log('Received local stream');
    // localVideo.srcObject = stream;
    // localStream = stream;
    //localVideo.src = window.URL.createObjectURL(stream);
    //
    localVideo.src = window.URL.createObjectURL(localStream);
    localVideo.srcObject = localStream;
}

function handleTrackEvent(event) {
    console.log("*** Track event");
    remoteVideo.srcObject = event.streams[0];
}

function handleAddStreamEvent(event) {
    console.log("*** Stream added");
    remoteVideo.srcObject = event.stream;
}

function handleNegotiationNeededEvent() {
    console.log("*** Negotiation needed");
    console.log("---> Creating offer");
    peerConnection.createOffer().then(function(offer) {
            console.log("---> Creating new description object to send to remote peer");
            return peerConnection.setLocalDescription(offer);
        })
        .then(function() {
            console.log("---> Sending offer to remote peer");

            $.get('/webrtc/pubsub.php', {
                from: $('#username').val(),
                to: $('#friend').val(),
                on: 'on-callrequest',
                desc: JSON.stringify(peerConnection.localDescription),
            });
        })
        .catch(function(err) {
            console.log(err, 'Error creating offer..');
        });
}

function onIceCandidate(event) {

    if (event.candidate) {
        $.get('/webrtc/pubsub.php', {
            from: $('#username').val(),
            to: $('#friend').val(),
            on: 'on-addicecandidate',
            candidate: JSON.stringify(event.candidate),
        });
    }
}

function onIceStateChange(event) {
    //console.log('ICE CHANGE');
}

function receiveCallRequest(from, desc) {
    console.log('Call requested...');
    var desc = JSON.parse(desc);
    peerConnection = new RTCPeerConnection({
        'iceServers': <?php echo json_encode($servers); ?>
    });
    peerConnection.onicecandidate = function(e) {
        onIceCandidate(e);
    };
    peerConnection.oniceconnectionstatechange = function(e) {
        onIceStateChange(e);
    };
    peerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    hasAddTrack = (peerConnection.addTrack !== undefined);
    if (hasAddTrack) {
        peerConnection.ontrack = handleTrackEvent;
    } else {
        peerConnection.onaddstream = handleAddStreamEvent;
    }
    var descRemote = new RTCSessionDescription(desc);
    peerConnection.setRemoteDescription(descRemote).then(function() {
            console.log("Setting up the local media stream...");
            return navigator.mediaDevices.getUserMedia(mediaConstraints);
        })
        .then(function(stream) {
            console.log("-- Local video stream obtained");
            localStream = stream;
            localVideo.src = window.URL.createObjectURL(localStream);
            localVideo.srcObject = localStream;
            if (hasAddTrack) {
                console.log("-- Adding tracks to the RTCPeerConnection");
                localStream.getTracks().forEach(track =>
                    peerConnection.addTrack(track, localStream)
                );
            } else {
                console.log("-- Adding stream to the RTCPeerConnection");
                peerConnection.addStream(localStream);
            }
        })
        .then(function() {
            console.log("------> Creating answer");
            // Now that we've successfully set the remote description, we need to
            // start our stream up locally then create an SDP answer. This SDP
            // data describes the local end of our call, including the codec
            // information, options agreed upon, and so forth.
            return peerConnection.createAnswer();
        })
        .then(function(answer) {
            console.log("------> Setting local description after creating answer");
            // We now have our answer, so establish that as the local description.
            // This actually configures our end of the call to match the settings
            // specified in the SDP.
            return peerConnection.setLocalDescription(answer);
        })
        .then(function() {

            // We've configured our end of the call now. Time to send our
            // answer back to the caller so they know that we want to talk
            // and how to talk to us.
            console.log("Sending answer packet back to other peer");
            //sendToServer(msg);
            //
            $.get('/webrtc/pubsub.php', {
                from: $('#username').val(),
                to: $('#friend').val(),
                on: 'on-callaccepted',
                desc: JSON.stringify(peerConnection.localDescription),
            });
        })
        .catch(function(err) {
            console.log(err, 'Error in accepting remote connection..');
        });

}

function receiveCallAccept(from, desc) {
    console.log('Call accepted...');
    var desc = JSON.parse(desc);
    var remoteDesc = new RTCSessionDescription(desc);
    peerConnection.setRemoteDescription(remoteDesc).catch(function(err) {
        console.log(err, 'Error accepting call...')
    });
}

function gotRemoteStream(e) {
    if (remoteVideo.srcObject !== e.streams[0]) {
        remoteVideo.srcObject = e.streams[0];
        console.log('Remote received remote stream');
    }
}

document.querySelector('#make_call').addEventListener('click', function(e) {
    console.log('Starting call...');
    peerConnection = new RTCPeerConnection({
        'iceServers': ''
    });
    peerConnection.onicecandidate = function(e) {
        onIceCandidate(e);
    };
    peerConnection.oniceconnectionstatechange = function(e) {
        onIceStateChange(e);
    };
    peerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    hasAddTrack = (peerConnection.addTrack !== undefined);
    if (hasAddTrack) {
        peerConnection.ontrack = handleTrackEvent;
    } else {
        peerConnection.onaddstream = handleAddStreamEvent;
    }
    console.log('requesting webcam access...');
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(function(localStream) {
        console.log("-- Local video stream obtained");
        localVideo.src = window.URL.createObjectURL(localStream);
        localVideo.srcObject = localStream;
        if (hasAddTrack) {
            console.log("-- Adding tracks to the RTCPeerConnection");
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        } else {
            console.log("-- Adding stream to the RTCPeerConnection");
            peerConnection.addStream(localStream);
        }
    }).catch(function(err) {
        alert(err);
    });

});

// Enable pusher logging - don't include this in production
//Pusher.logToConsole = true;
var pusher = new Pusher('cc652d98262ccd7cb9df', {
    cluster: 'ap1',
    encrypted: true
});
var channel = pusher.subscribe('my-channel');
channel.bind('on-callrequest', function(data) {
    console.log('Call requested..');
    if (data.to) {
        if (data.to == $('#username').val()) {
            //message is for me
            if (data.desc) {
                receiveCallRequest(data.from, data.desc);
            }
        }
    }
});
channel.bind('on-callaccepted', function(data) {
    console.log('Call accepted..');
    if (data.to) {
        if (data.to == $('#username').val()) {
            //message is for me
            if (data.desc) {
                receiveCallAccept(data.from, data.desc);
            }
        }
    }
});
channel.bind('on-addicecandidate', function(data) {
    if (data.to) {
        if (data.to == $('#username').val()) {
            //message is for me
            if (data.candidate) {
                console.log('Adding ice candidate...');
                var iceCandidate = JSON.parse(data.candidate);
                //console.log(iceCandidate);
                if (!iceCandidate) {
                    return;
                }
                if (!peerConnection && peerConnection.remoteDescription) {}
                peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate),
                    function() {
                        console.log('Success setting ice candidate..');
                    },
                    function(err) {
                        console.log(err);
                    });
            }
        }
    }
});