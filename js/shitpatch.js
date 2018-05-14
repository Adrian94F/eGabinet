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
			$('#splash').hide();
		},
		true
	);
}

$(document).ready(function(){
	$('#splash').show();
	getRoomName();
	setTimeout(function() {
		$('#splash').hide();
	}, 10000);

});