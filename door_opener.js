/* Oto postawiłem jako dar przed tobą drzwi otwarte, 
których nikt nie może zamknąć, 
bo ty chociaż moc masz znikomą, 
zachowałeś moje słowo 
i nie zaparłeś się mego imienia. 
Ap 3,8 */

function setCookie(cname, cvalue, exhours) {
	var d = new Date();
	d.setTime(d.getTime() + (exhours * 60 * 60 * 1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function openTheDoor() {

	var acc = getCookie("accessToken");
	var ref = getCookie("refreshToken");

	if (acc != "" && ref != "")	{
		if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "login.html") {
			document.location.href = "index.html";
		}
	}
	else
		if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) != "login.html") {
			document.location.href = "login.html";
		}

}

var host = "https://e-gabinet.org.pl:8181";
/*if (location.protocol != 'https:')
	host = "http://e-gabinet.org.pl:8080";*/

function request(_url, _data, _success, _error) {
	var acc = "";
	var ref = "";
	acc = getCookie("accessToken")
	ref = getCookie("refreshToken")
	var _headers = {"Authorization": acc + ":" + ref};

	//console.log(_headers);
	$.ajax({
		url: _url,
		type: "POST",
		data: JSON.stringify(_data),
		contentType: "application/json",
		dataType: "json",
		headers: _headers,
		success: _success,
		error: _error
	});
}

function login() {
	// get username and password
	var user = document.loginform.username.value;
	var pass = document.loginform.password.value;
	var remember = document.loginform.rememberMe.checked;
	var data = {"login": user, "password": pass};
	
	request(host + "/security/access",
		data,
		function (response) {
			//console.log(response);
			var credentials = response;
			var hours = 1;
			if (remember)
				hours = 99999;
			setCookie("accessToken", response["accessToken"], hours);
			setCookie("refreshToken", response["refreshToken"], hours);

			getMe();

			document.location.href = "index.html";
		},
		function() {
			$('.alert').show();
		}
	);
}

function logout() {
	var data = {"accessToken": getCookie("accessToken"), "refreshToken": getCookie("refreshToken")};
	request(host + "/security/delete",
		data,
		function (response) {},
		function() {}
	);
	setCookie("accessToken", "", 0);
	setCookie("refreshToken", "", 0);
	document.location.href = "login.html";
}

// Detect pressed CapsLock il login view
document.addEventListener('keydown', function(event) {
	var caps = event.getModifierState && event.getModifierState('CapsLock');
	//console.log(caps);
	if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "login.html" && caps)
		$('#caps-alert').show();
	else
		$('#caps-alert').hide();
});

function getMe() {
	var me = 0;
	var hours = 99999;
	request(host + "/user/get/me",
		{},
		function(response) {
			setCookie("id", response["id"], hours);
			setCookie("email", response["email"], hours);
			setCookie("name", response["name"], hours);
			setCookie("surname", response["surname"], hours);
			setCookie("doctorid", response["doctorid"], hours);
			setCookie("patientid", response["patientid"], hours);
			var role = Math.max.apply(null, response["roles"]);
			setCookie("role", role, hours);

			document.getElementById('1st-2nd-name').innerHTML = response["name"] + " " + response["surname"];
		},
		function() {}
	);
	return me;
}

openTheDoor();

if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) != "login.html")
	getMe();