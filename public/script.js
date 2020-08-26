// const { text } = require("express");

const socket = io('/');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}

const videoGrid = document.getElementById('video-grid');
let myVideoStream;

var peer = new Peer(undefined, {
    path: 'peerjs',
    host: '/',
    port: '443',
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)
    
    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    
    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })  
});

socket.on('user-disconnected', userId => {
    if (peers[userId]) {
        peers[userId].close();
    }
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
    console.log(ROOM_ID);
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    console.log(userId);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () => { 
        video.remove();
    })
    peers[userId]=call
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}
let name
document.getElementById('create').addEventListener('click', () => {
    name = document.getElementById('name').value;
    document.getElementById("create_room").style.display="none";
    document.getElementById("main").style.display="flex";
})

socket.on('createMessage', (user,message) => {
    $('.messages').append(`<li class="message"><b>${user}</b><br>${message}</li><br>`)
})

const scrollToBottom = () => {
    let d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        StopVideo();
    } else {
        PlayVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const StopVideo = () => {
    const html = 
    `<i class="stopVideo fas fa-video-slash"></i>
    <span>Play Video</span>`

    document.querySelector('.main_video_button').innerHTML = html;
}

const PlayVideo = () => {
    const html = 
    `<i class="fas fa-video"></i>
    <span>Stop Video</span>`

    document.querySelector('.main_video_button').innerHTML = html;
}

const muteUnmute = () => {
    const enabled  = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled=true;
    }
}

const setMuteButton = () => {
    const html = 
    `<i class="fas fa-microphone"></i>
    <span>Mute</span>`

    document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = 
    `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`

    document.querySelector('.main_mute_button').innerHTML = html;
}

let msg = $('input');

$('html').keydown((e) => {
    if(e.which == 13 && msg.val().length !== 0) {
        console.log(msg.val());
        socket.emit('message', name, msg.val() );
        msg.val('');
    }
})