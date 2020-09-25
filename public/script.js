const socket = io("/");
const videoGrid = document.getElementById("video-grid");

const myPeer = new Peer(undefined);
console.log(myPeer);
const myVideo = document.createElement("video");
myVideo.muted = true;
const peer = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", call => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })
    socket.on("user-connected", userId => {
        connectToNewUser(userId, stream);
    })
});

myPeer.on("open", id => {
    socket.emit("join-room", 10, id);
})


socket.on("user-connected", userId => {
    console.log("User Connected : " + userId);
});

socket.on("user-disconnected", userId => {
    if (peer[userId]) {
        peer[userId].close()
    }
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");

    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    call.on("close", () => {
        video.remove();
    });

    peer[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadmetadata", () => {
        video.play();
    });

    videoGrid.append(video);
}