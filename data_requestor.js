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
		function() {},
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

if (!isCurrent("login.html")) // always instead of login page
	getMe();

if (isCurrent("index.html") && getCookie("role") == 0) { // if patient on main menu
	$("#users-menu").remove();
	$("#scheduler-button").remove();
	$("#scheduler-text").html("Najbliższa wideorozmowa:</p><p>...");
	//request
	//update
}

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
				"userId": id/*,
				"admin": (role == 2 ? true : false)*/
			},
			function(response) {
				console.log(response);
				if (id == 0 && role != 2) {
					// add user to list of admins/doctors/rehabs
					id = response["addedUserId"];
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
				}
				refreshUsersTable();
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
		id,
		function() {
			console.log(id + " przepadł w odbyt... znaczy niebyt.");
		},
		function() {},
		true,
		true
	);
}

function removeUser () {
	console.log("USUWANIE CZŁOWIEKA NIE BANGLA!!!");
	//return;
	var id = $('#user-id').val();
	var role = $('#user-role').val();
	var addr = "/admin/doctor/delete";
	var subID;
	if (role == 2) {
		for (u in users["admins"])
			if (id = users["admins"][u]["id"]) {
				adminUserDelete(id);
				return;
			}
	} else {
		if (role == 1)
			for (u in users["rehabs"])
				if (id = users["rehabs"][u]["id"]) {
					subID = users["rehabs"][u]["doctorId"];
					break;
				}
		else {
			addr = "/doctor/patient/delete";
			for (u in users["patients"])
				if (id = users["patients"][u]["id"]) {
					subID = users["patients"][u]["patientId"];
					break;
				}
		}
		// remove doctor or patient
		request(host + addr,
			subID,
			function() {
				// remove user
				adminUserDelete(id);
			},
			function() {},
			true,
			true
		);
	}
}


if (isCurrent("schedule.html"))
	if (getCookie("role") == 0)
		document.location.href = "index.html";

function openVideoEditWindow(button) {
	if (button) {
		// existing user
		var row = button.parentNode.parentNode;
		var id = row.cells[0].innerHTML;
		var date = row.cells[1].innerHTML;
		var start = row.cells[2].innerHTML;
		var stop = row.cells[3].innerHTML;
		//rehab
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
	}
	$('#edit-videocall').show();
}

function closeVideoEditWindow(save) {
	if (save) {
		var id = $('#videocall-id').val();
		var date = $('#videocall-date').val();
		var start = $('#videocall-start').val();
		var stop = $('#videocall-stop').val();
		//rehab
		var existing_visit = false;

		var table = document.getElementById('table');
		for (var r = 0, n = table.rows.length; r < n; r++) {
			var cells = table.rows[r].cells;
			if (cells[0].innerHTML == id) {
				existing_visit = true;
				cells[1].innerHTML = date;
				cells[2].innerHTML = start;
				cells[3].innerHTML = stop;
			}
		}
		if (!existing_visit) {
			var row = table.insertRow(table.rows.length);
			row.appendChild(document.createElement("th")).innerHTML = "newID";
			row.insertCell(1).innerHTML = date;
			row.insertCell(2).innerHTML = start;
			row.insertCell(3).innerHTML = stop;
			row.insertCell(4).innerHTML = "////rehab...";
			row.insertCell(5).innerHTML = '<button type="button" class="btn btn-sm btn-outline-primary" onclick="openVideoEditWindow(this)">Edytuj</button>';
		}
	}
	$('#edit-videocall').hide();
}

function removeVideocall () {
	var id = $('#videocall-id').val();
	var table = document.getElementById('table');
		for (var r = 0, n = table.rows.length; r < n; r++) {
			if (table.rows[r].cells[0].innerHTML == id) {
				table.deleteRow(r);
				break;
			}
		}
}