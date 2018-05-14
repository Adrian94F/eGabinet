function getRoomName() {
	request(host + "/user/get/nextappointment",
		0,
		function(response) {
			console.log("got appointment");
			start = response["start"];
			rehab = response["rehab"]["id"];
			var url = 'https://appear.in/egabinet-room-' + rehab + '-' + start;
			$('#ifr').attr('src', url);
		},
		function() {
			$('#ifr').remove();
		},
		true
	);
}

$(document).ready(function(){
	getRoomName();
});