// grab the room from the URL
// var room = location.search && location.search.split('?')[1];
var room = getCookie("rehab");

// create our webrtc connection
var webrtc = new SimpleWebRTC({
	url: "e-gabinet.org.pl:8888",
	// the id/element dom element that will hold "our" video
	localVideoEl: 'yourVideo',
	// the id/element dom element that will hold remote videos
	remoteVideosEl: '',
	// immediately ask for camera access
	autoRequestMedia: true,
	debug: false,
	detectSpeakingEvents: true,
	autoAdjustMic: true,
	nick: getCookie("nick")
});

function toggl_mute() {
	if ($("#mic_ctrl").css("background-image").indexOf("img/mic.png") != -1){
		$("#mic_ctrl").css("background-image","url(img/no_mic.png)")
		webrtc.mute();
	}
	else{
		$("#mic_ctrl").css("background-image","url(img/mic.png)")
		webrtc.unmute();
	}
}

function toggl_video() {
	if ($("#video_ctrl").css("background-image").indexOf("img/play.png") != -1){
		$("#video_ctrl").css("background-image","url(img/pause.png)");
		webrtc.pauseVideo();
	}
	else{
		$("#video_ctrl").css("background-image","url(img/play.png)");
		webrtc.resumeVideo();
	}
	
}

// when it's ready, join if we got a room from the URL
webrtc.on('readyToCall', function () {
	// you can name it anything
	if (room) webrtc.joinRoom(room);
});

// function showVolume(el, volume) {
//     if (!el) return;
//     if (volume < -45) volume = -45; // -45 to -20 is
//     if (volume > -20) volume = -20; // a good range
//     el.value = volume;
// }
// we got access to the camera
// webrtc.on('localStream', function (stream) {
//     var button = document.querySelector('form>button');
//     if (button) button.removeAttribute('disabled');
//     $('#localVolume').show();
// });

// we did not get access to the camera
webrtc.on('localMediaError', function (err) {
});

// local screen obtained
webrtc.on('localScreenAdded', function (video) {
	video.onclick = function () {
		video.style.width = video.videoWidth + 'px';
		video.style.height = video.videoHeight + 'px';
	};
	document.getElementById('localScreenContainer').appendChild(video);
	$('#localScreenContainer').show();
});

// local screen removed
webrtc.on('localScreenRemoved', function (video) {
	document.getElementById('localScreenContainer').removeChild(video);
	$('#localScreenContainer').hide();
});

webrtc.on('connectionReady', function (sesionId) {
	console.log('my id', sesionId);
});

function adjustSizes() {
	// check number of video divs
	var videos = document.getElementsByClassName('videoContainer')
	var nOfVideos = videos.length;
	var cols = 1;
	var rows = 1;
	if (nOfVideos > 1) {
		cols = 2;
		if (nOfVideos > 2) {
			rows = 2;
		}
		if (nOfVideos > 4) {
			cols = 3;
			rows = 3;
		}
		if (nOfVideos > 9) {
			cols = 4;
			rows = 4;
		}
	}
	console.log("rows: " + rows + ", cols: " + cols);

	var width = [83.333 / cols, (30 / cols) + 15];

	// for every video div: set width and height based on number of divs
	for (var v = 0; v < nOfVideos; v++) {
		var vid = 0;
		while (vid == 0)
			vid = videos[v].getElementsByTagName("video");
		vid = vid[0];
		vid.style.width = "calc(" + width[0] + "vw - " + width[1] + "px)";
		vid.style.marginRight = "15px";
		console.log(vid);
	}
}

// a peer video has been added
webrtc.on('videoAdded', function (video, peer) {
	console.log('video added', peer);
	// I am a patient, I don't want to see others than rehab
	if ((webrtc.config.nick != getCookie("rehab") && peer["nick"] != getCookie("rehab"))
	// I cannot connect to myself
	|| peer["nick"] == webrtc.config.nick) {
		video.volume = 0;
		return -1;
	}

	var remotes = document.getElementById('remotes');
	if (remotes) {
		var container = document.createElement('div');
		container.className = 'videoContainer';
		container.id = 'container_' + webrtc.getDomId(peer);
		container.style.cssFloat = "left";
		container.appendChild(video);

		// suppress contextmenu
		video.oncontextmenu = function () { 
			return false; 
		};

		// resize the video on click
		video.onclick = function () {
			container.style.width = video.videoWidth + 'px';
			container.style.height = video.videoHeight + 'px';
		};

		/*
		// show the remote volume
		var vol = document.createElement('meter');
		vol.id = 'volume_' + peer.id;
		vol.className = 'volume';
		vol.min = -45;
		vol.max = -20;
		vol.low = -40;
		vol.high = -25;
		container.appendChild(vol);

		// add muted and paused elements
		var muted = document.createElement('span');
		vol.className = 'muted';
		container.appendChild(muted);

		var muted = document.createElement('span');
		vol.className = 'muted';
		container.appendChild(muted);*/

		// show the ice connection state
		if (peer && peer.pc) {
			var connstate = document.createElement('div');
			connstate.className = 'connectionstate';
			container.appendChild(connstate);
			peer.pc.on('iceConnectionStateChange', function (event) {
				switch (peer.pc.iceConnectionState) {
					case 'checking':
					connstate.innerText = 'Łączenie z peerem...';
					break;
					case 'connected':
					case 'completed': // on caller side
					// $(vol).show();
					connstate.innerText = 'Połączenie nawiązane';
					break;
					case 'disconnected':
					connstate.innerText = 'Rozłączony';
					break;
					case 'failed':
					connstate.innerText = 'Połączenie nieudane';
					break;
					case 'closed':
					connstate.innerText = 'Połączenie zakończone';
					break;
				}
			});
		}

		remotes.appendChild(container);
	}

	adjustSizes();
});

// a peer was removed
webrtc.on('videoRemoved', function (video, peer) {
	console.log('video removed ', peer);
	var remotes = document.getElementById('remotes');
	var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
	if (remotes && el) {
		remotes.removeChild(el);
	}

	adjustSizes();
});

// local volume has changed
// webrtc.on('volumeChange', function (volume, treshold) {
//     showVolume(document.getElementById('localVolume'), volume);
// });
// // remote volume has changed
// webrtc.on('remoteVolumeChange', function (peer, volume) {
//     showVolume(document.getElementById('volume_' + peer.id), volume);
// });

// local p2p/ice failure
webrtc.on('iceFailed', function (peer) {
	var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
	console.log('local fail', connstate);
	if (connstate) {
		connstate.innerText = 'Connection failed.';
		// fileinput.disabled = 'disabled';
	}
});

// remote p2p/ice failure
webrtc.on('connectivityError', function (peer) {
	var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
	console.log('remote fail', connstate);
	if (connstate) {
		connstate.innerText = 'Connection failed.';
// fileinput.disabled = 'disabled';
}
});

// Since we use this twice we put it here
function setRoom(name) {
	//     document.querySelector('form').remove();
	//     document.getElementById('title').innerText = 'Room: ' + name;
	//     document.getElementById('subTitle').innerText =  'Link to join: ' + location.href;
	$('body').addClass('active');
}

if (room) {
	setRoom(room);
} else {
	$('form').submit(function () {
		var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
		webrtc.createRoom(val, function (err, name) {
			console.log(' create room cb', arguments);
			var newUrl = location.pathname + '?' + name;
			if (!err) {
				history.replaceState({foo: 'bar'}, null, newUrl);
				setRoom(name);
			} else {
				console.log(err);
			}
		});
		return false;
	});
}

// var button = document.getElementById('screenShareButton'),
//     setButton = function (bool) {
//         button.innerText = bool ? 'share screen' : 'stop sharing';
//     };
// if (!webrtc.capabilities.supportScreenSharing) {
//     button.disabled = 'disabled';
// }
// webrtc.on('localScreenRemoved', function () {
//     setButton(true);
// });
// setButton(true);
// button.onclick = function () {
//     if (webrtc.getLocalScreen()) {
//         webrtc.stopScreenShare();
//         setButton(true);
//     } else {
//         webrtc.shareScreen(function (err) {
//             if (err) {
//                 setButton(true);
//             } else {
//                 setButton(false);
//             }
//         });
//     }
// };

// listen for mute and unmute events
webrtc.on('mute', function (data) { // show muted symbol
	webrtc.getPeers(data.id).forEach(function (peer) {
		console.log("muted: " + peer);
		if (data.name == 'audio') {
			$('#videocontainer_' + webrtc.getDomId(peer) + ' .muted').show();
		} else if (data.name == 'video') {
			$('#videocontainer_' + webrtc.getDomId(peer) + ' .paused').show();
			$('#videocontainer_' + webrtc.getDomId(peer) + ' video').hide();
		}
	});
});

webrtc.on('unmute', function (data) { // hide muted symbol
	webrtc.getPeers(data.id).forEach(function (peer) {
		console.log("unmuted: " + peer);
		if (data.name == 'audio') {
			$('#videocontainer_' + webrtc.getDomId(peer) + ' .muted').hide();
		} else if (data.name == 'video') {
			$('#videocontainer_' + webrtc.getDomId(peer) + ' video').show();
			$('#videocontainer_' + webrtc.getDomId(peer) + ' .paused').hide();
		}
	});
});