/*
Get data about user
*/
function getMe() {
	var name = "";
	var surname = "";
	name = getCookie("name");
	surname = getCookie("surname");

	document.getElementById('1st-2nd-name').innerHTML = name + " " + surname;

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

			if (name != response["name"] || surname != response["surname"]) {
				document.getElementById('1st-2nd-name').innerHTML = response["name"] + " " + response["surname"];
				console.log("different name or surname");
				setCookie("name", response["name"], hours);
				setCookie("surname", response["surname"], hours);
			}
		},
		function() {
			logout();
		},
		true
	);
}

function isCurrent(filename) {
	if (document.location.pathname.substring(location.pathname.lastIndexOf("/") + 1) == filename)
		return true
	else
		return false
}

var me = 0;


/*
LOGIN
*/
if (!isCurrent("login.html")) { // always instead of login page
	getMe();
	setInterval(function() { // refresh tokens every minute
		data = {"accessToken": getCookie("accessToken"), "refreshToken": getCookie("refreshToken")};
		request(host + "/security/refresh",
			data,
			function (response) {
				setCookie("accessToken", response["accessToken"], 9999);
				setCookie("refreshToken", response["refreshToken"], 9999);
			},
			function() {},
			true
		);
	}, 60000);
}


/*
INDEX
*/
if (isCurrent("index.html") && getCookie("role") == 0) { // if patient on main menu
	$("#users-menu").remove();
	$("#scheduler-button").remove();
	$("#scheduler-text").html("Najbliższa wideorozmowa:</p><p>...");
	//request
	//update
}


/*
PROFILE
*/
if (isCurrent("profile.html")) { // profile view
	$("#user-name").val(getCookie("name"));
	$("#user-surname").val(getCookie("surname"));
	$("#user-email").val(getCookie("email"));
}

function newPassword() {
	if ($('#user-pass').val() == $('#user-pass-2').val()) {
		// send request for password change
		$('#edit-user').hide();
	}
	else if ($('#user-pass').val() == "" || $('#user-pass-2').val() == "") {

	} else {
		$('.alert').show();
		$('#user-pass').val("");
		$('#user-pass-2').val("");
	}
}

var user_roles = ["Pacjent", "Rehabilitant", "Administrator"];
var users = [];

function refreshUsersTable() {
	request(host + "/user/get/lists",
		0,
		function(response) {
			console.log("got users");
			users = response;
			var table = document.getElementById('table');
			var labels = ["patients", "rehabs"];
			if (getCookie("role") == 2)
				labels.push("admins");
			table.innerHTML = '<thead><tr><th scope="col">ID</th><th scope="col">Nazwisko</th><th scope="col">Imię</th><th scope="col">Email</th><th scope="col">Rola</th><th scope="col">Edycja</th></tr></thead><tbody></tbody>'
			for (l in labels) {
				for (var u = 0; u < users[labels[l]].length; u++) {
					var row = table.insertRow(table.rows.length);
					row.insertCell(0).innerHTML = users[labels[l]][u]["id"];
					row.insertCell(1).innerHTML = users[labels[l]][u]["surname"];
					row.insertCell(2).innerHTML = users[labels[l]][u]["name"];
					row.insertCell(3).innerHTML = users[labels[l]][u]["email"];
					var role = Math.max.apply(null, users[labels[l]][u]["roles"]);
					row.insertCell(4).innerHTML = user_roles[role];
					row.insertCell(5).innerHTML = '<button type="button" class="btn btn-sm btn-outline-primary" onclick="openEditWindow(this)">Edytuj</button>';
				}
			}
		},
		function() {},
		true
	);
}

if (isCurrent("users.html")) {
	if (getCookie("role") == 0)
		document.location.href = "index.html";
	else {		
		if (getCookie("role") == 2) {
			user_roles.push("Administrator");
			var select_role = document.getElementById("user-role");
			var optionAdm = document.createElement("option");
			optionAdm.text = "Administrator";
			optionAdm.value = 2;
			var optionReh = document.createElement("option");
			optionReh.text = "Rehabilitant";
			optionReh.value = 1;
			select_role.add(optionReh);
			select_role.add(optionAdm);
		}
		refreshUsersTable();
	}
}

function openEditWindow(button) {
	if (button) { // existing user
		var row = button.parentNode.parentNode;
		var id = row.cells[0].innerHTML;
		var first_name = row.cells[2].innerHTML;
		var second_name = row.cells[1].innerHTML;
		var email = row.cells[3].innerHTML;
		var role = row.cells[4].innerHTML;
		$('#user-id').val(id);
		$('#user-first-name').val(first_name);
		$('#user-second-name').val(second_name);
		$('#user-email').val(email);
		$('#user-role').val(user_roles.indexOf(role)).change();
	}
	else { // new user
		$('#user-id').val("");
		$('#user-first-name').val("");
		$('#user-second-name').val("");
		$('#user-email').val("");
		$('#user-role').val(0).change();
	}
	$('#user-pass').val("");
	$('#user-pass-2').val("");
	$('#edit-user').show();
}

function closeEditWindow(save) {
	// TODO: zmiana roli!!!
	if (save) {
		var id = $('#user-id').val();
		var name = $('#user-first-name').val();
		var surname = $('#user-second-name').val();
		var email = $('#user-email').val();
		var role = $('#user-role').val();
		var password = $('#user-pass').val();
		
		var addr = "/admin/user/add"; // new user
		if (id != 0) {
			addr = "/admin/user/edit"; //existing user
		}

		request(host + addr,
			{
				"email": email,
				"name": name,
				"password": password,
				"surname": surname,
				"userId": id,
				"admin": (role == 2 ? true : false)
			},
			function(response) {
				console.log(response);
				if (id == 0 && role != 2) {
					id = response["addedUserId"];
					if (id != 0) {
						if (role == 0)
							addr = "/doctor/patient/add";
						else if (role == 1)
							addr = "/admin/doctor/add";
						request(host + addr,
							{
								"userId": id
							},
							function() {
								refreshUsersTable();
							},
							function() {},
							true
						);
					} else {
						refreshUsersTable();
					}
				} else {
					refreshUsersTable();
				}
			},
			function() {},
			true
		);

		if (id == 0) {
			
		}
	}

	$('#edit-user').hide();
}

function adminUserDelete(id) {
	addr = "/admin/user/delete";
	request(host + addr,
		parseInt(id),
		function() {
			console.log(id + " przepadł w odbyt... znaczy niebyt.");
			refreshUsersTable();
		},
		function() {},
		true
	);
}

function removeUser () {
	console.log("USUWANIE CZŁOWIEKA NIE BANGLA!!!");
	//return;
	var id = $('#user-id').val();
	var role = $('#user-role').val();
	var addr;
	var subID;
	if (role == 2) {
		for (u in users["admins"])
			if (id == users["admins"][u]["id"]) {
				adminUserDelete(id);
				return;
			}
	} else {
		if (role == 1) {
			addr = "/admin/doctor/delete"
			for (u in users["rehabs"])
				if (id == users["rehabs"][u]["id"]) {
					subID = users["rehabs"][u]["doctorId"];
					break;
				}
		} else {
			addr = "/doctor/patient/delete";
			for (u in users["patients"])
				if (id == users["patients"][u]["id"]) {
					subID = users["patients"][u]["patientId"];
					break;
				}
		}
		// remove doctor or patient
		console.log(addr + " - delete patient/doctor " + subID);
		request(host + addr,
			parseInt(subID),
			function() {
				// remove user
				adminUserDelete(id);
			},
			function() {},
			true
		);
	}
}


/*
APPOINTMENTS
*/
var appointments;

function refreshAppointmentsTable() {
	// get all appointments, refresh table
	console.log("odświeżam... tabelkę");
	var addr = (getCookie("role") == 2 ? "/admin/get/appointments" : "/doctor/get/appointments");
	request(host + addr,
		0,
		function(response) {
			console.log("got appointments");
			appointments = response;
			var table = document.getElementById('table');
			table.innerHTML = '<th scope="col">ID</th><th scope="col">Data</th><th scope="col">Czas rozpoczęcia</th><th scope="col">Czas zakończenia</th><th scope="col">Rehabilitant</th><th scope="col">Pacjent</th><th scope="col">Edycja</th><tbody></tbody>';
			for (var a in appointments) {
				var row = table.insertRow(table.rows.length);
				var date = new Date(appointments[a]["start"]);
				var day = date.toLocaleDateString();
				var start = date.toLocaleTimeString();
				date = new Date(appointments[a]["end"]);
				var stop = date.toLocaleTimeString();
				row.insertCell(0).innerHTML = appointments[a]["id"];
				row.insertCell(1).innerHTML = day;
				row.insertCell(2).innerHTML = start;
				row.insertCell(3).innerHTML = stop;
				row.insertCell(4).innerHTML = appointments[a]["rehab"]["name"] + " " + appointments[a]["rehab"]["surname"];
				row.insertCell(5).innerHTML = appointments[a]["patient"]["name"] + " " + appointments[a]["patient"]["surname"];
				row.insertCell(6).innerHTML = '<button type="button" class="btn btn-sm btn-outline-primary" onclick="openVideoEditWindow(this)">Edytuj</button>';
			}
		},
		function() {},
		true
	);
}

if (isCurrent("schedule.html"))
	if (getCookie("role") == 0)
		document.location.href = "index.html";
	else {
		// get rehabs & patients, fill selectors
		request(host + "/user/get/lists",
			0,
			function(response) {
				console.log("got users");
				users = response;
				var select = document.getElementById("videocall-rehab");
				for (r in users["rehabs"]) {
					var option = document.createElement("option");
					option.text = users["rehabs"][r]["name"] + " " + users["rehabs"][r]["surname"];
					option.value = users["rehabs"][r]["doctorId"];
					select.add(option);
				}
				select = document.getElementById("videocall-patient");
				for (p in users["patients"]) {
					var option = document.createElement("option");
					option.text = users["patients"][p]["name"] + " " + users["patients"][p]["surname"];
					option.value = users["patients"][p]["patientId"];
					select.add(option);
				}
				refreshAppointmentsTable();
			},
			function() {},
			true
		);
	}

function openVideoEditWindow(button) {
	if (button) {
		// existing appointment
		var row = button.parentNode.parentNode;
		var id = row.cells[0].innerHTML;
		var date = row.cells[1].innerHTML;
		var start = row.cells[2].innerHTML;
		var stop = row.cells[3].innerHTML;
		for (a in appointments) {
			if (appointments[a]["id"] == id) {
				$('#videocall-rehab').val(appointments[a]["rehab"]["doctorId"]);
				$('#videocall-patient').val(appointments[a]["patient"]["patientId"]);
			}
		}
		var rehabId = appointments["id" == 1]
		$('#videocall-id').val(id);
		$('#videocall-date').val(date);
		$('#videocall-start').val(start);
		$('#videocall-stop').val(stop);
	}
	else {
		$('#videocall-id').val("");
		$('#videocall-date').val("");
		$('#videocall-start').val("");
		$('#videocall-stop').val("");
		$('#videocall-rehab').val("");
		$('#videocall-patient').val("");
	}
	$('#edit-videocall').show();
}

function closeVideoEditWindow(save) {
	if (save) {
		var id = $('#videocall-id').val();
		var date = $('#videocall-date').val();
		var start = $('#videocall-start').val();
		var stop = $('#videocall-stop').val();
		var rehab = $('#videocall-rehab').val();
		var patient = $('#videocall-patient').val();
		var addr;
		var data;
		if (id) {
			// existing appointment
			addr = "/doctor/appointment/edit";
			data = {
				"appointmentId": parseInt(id),
				"doctorId": parseInt(rehab),
				"end": date + " " + stop,
				"patientId": parseInt(patient),
				"start": date + " " + start
			};
		} else {
			// new appointment
			addr = "/doctor/appointment/add";
			data = {
				"doctorId": parseInt(rehab),
				"end": date + " " + stop,
				"patientId": parseInt(patient),
				"start": date + " " + start
			};
		}
		request(host + addr,
			data,
			function(response) {
				refreshAppointmentsTable();
			},
			function() {},
			true
		);
	}
	$('#edit-videocall').hide();
}

function removeVideocall () {
	var id = $('#videocall-id').val();
	request(host + "/doctor/appointment/delete",
		parseInt(id),
		function(response) {
			refreshAppointmentsTable();
		},
		function() {},
		true
	);
	console.log("usuwam wydarzenie");
}