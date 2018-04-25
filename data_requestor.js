function getMe() {
	var name = "";
	var surname = "";
	name = getCookie("name");
	surname = getCookie("surname");

	document.getElementById('1st-2nd-name').innerHTML = name + " " + surname;

	var hours = 99999;
	var response = 0;
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

			if (name != response["name"] || surname != response["surname"]) {
				document.getElementById('1st-2nd-name').innerHTML = response["name"] + " " + response["surname"];
				console.log("different name or surname");
				setCookie("name", response["name"], hours);
				setCookie("surname", response["surname"], hours);
			}
		},
		function() {},
		true
	);
	return response;
}

openTheDoor();

if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) != "login.html")
	getMe();