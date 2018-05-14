function setRoom(rName) {
	var url = 'https://appear.in/' + rName;
	$('#ifr').attr('src', url);
}

function getRoomName() {
	request(host + "/user/get/nextappointment",
		0,
		function(response) {
			console.log("got appointment");
			start = response["start"];
			rehab = response["rehab"]["id"];
			name = 'egabinet-rehab-room-' + rehab + start;
			setRoom(name);
		},
		function() {
			name = 'egabinet-demo-room';
			setRoom(name);
		},
		true
	);
	return name;
}

$(document).ready(function(){
	getRoomName();
});