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

	//alert(acc + " " + ref);

	if (acc != "" && ref != "")
	{
		if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "login.html" /*document.location.href == "login.html"*/)
		{
			document.location.href = "index.html";
		}
	}
	else
		if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) != "login.html")
		{
			//alert("Zaloguj się!")
			document.location.href = "login.html"
		}

}

function login() {
	// get username and password
	var user = document.loginform.username.value;
	var pass = document.loginform.password.value;
	var remember = document.loginform.rememberMe.checked;
	var data = {"login": user, "password": pass};
	var host = "https://e-gabinet.org.pl:8181";

	if (location.protocol != 'https:')
		host = "http://e-gabinet.org.pl:8080";

	// send request for token
	$.ajax({
		url: host + "/security/access",
		type: "POST",
		data: JSON.stringify(data),
		contentType: "application/json",
		dataType: "json",
		success: function (response) {
			//console.log(response);
			var credentials = response;
			var hours = 1;
			if (remember)
				hours = 99999;
			setCookie("accessToken", response["accessToken"], hours);
			setCookie("refreshToken", response["refreshToken"], hours);
			//alert(getCookie("accessToken") + ":" + getCookie("refreshToken"));
			document.location.href = "index.html";
		},
		error: function() {
			$('.alert').show();
			//alert("Niepoprawne dane logowania");
		}
	})
}

function logout() {
	setCookie("accessToken", "", 0);
	setCookie("refreshToken", "", 0);
	document.location.href = "login.html";
}

// Check tokens
openTheDoor();

// Detect pressed CapsLock il login view
document.addEventListener('keydown', function(event) {
	var caps = event.getModifierState && event.getModifierState('CapsLock');
	//console.log(caps);
	if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == "login.html" && caps)
		$('#caps-alert').show();
	else
		$('#caps-alert').hide();
});
