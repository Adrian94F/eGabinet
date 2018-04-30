//Create an account on Firebase, and use the credentials they give you in place of the following
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBngW2f2ty9lFFdHtzdDuRVLFBM8v16ZJk",
    authDomain: "egabinet-1d5ab.firebaseapp.com",
    databaseURL: "https://egabinet-1d5ab.firebaseio.com",
    projectId: "egabinet-1d5ab",
    storageBucket: "",
    messagingSenderId: "107530078442"
};
firebase.initializeApp(config);


var database = firebase.database().ref();
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random()*1000000000);
//var servers = {'iceServers': [{'urls': 'turn:numb.viagenie.ca','credential': 'pwrwekaw4','username': '210047@student.pwr.edu.pl'}]};
var servers = {'iceServers': [{'urls': 'stun:e-gabinet.org.pl:5349','credential': 'motznehaslo','username': 'dave'}, {'urls': 'turn:e-gabinet.org.pl:3478','credential': 'motznehaslo','username': 'dave'}]};

var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId) {
        if (msg.ice != undefined)
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc.createAnswer())
              .then(answer => pc.setLocalDescription(answer))
              .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
        else if (msg.sdp.type == "answer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
};

database.on('child_added', readMessage);

function showMyFace() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => yourVideo.srcObject = stream)
    .then(stream => pc.addStream(stream));
}

function showFriendsFace() {
  document.getElementById("connect-btn").style.display = "none";
  friendsVideo.style.display = "block";
  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
}
