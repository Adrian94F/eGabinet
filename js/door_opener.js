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
if (location.protocol != 'https:')
	host = "http://e-gabinet.org.pl:8080";

function request(url, data, success, error, auth) {
	var acc = "";
	var ref = "";
	acc = getCookie("accessToken")
	ref = getCookie("refreshToken")
	var headers = 0;
	if (auth) {
		headers = {"Authorization": acc + ":" + ref};
		console.log('with header Authorization: ' + acc + ':' + ref);
	}
	data = JSON.stringify(data);
	$.ajax({
		url: url,
		type: "POST",
		data: data,
		contentType: "application/json",
		dataType: "json",
		headers: headers,
		success: success,
		error: error
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
if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "login.html") {
	document.addEventListener('keydown', function(event) {
		var caps = event.getModifierState && event.getModifierState('CapsLock');
		//console.log(caps);
		if (caps)
			$('#caps-alert').show();
		else
			$('#caps-alert').hide();
	});
}

openTheDoor();
