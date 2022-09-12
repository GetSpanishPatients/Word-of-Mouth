/**
 * @version 1.0
 * @author Luis Azáldegui
 */	

	// + --------------------------------------------------------------------------- +
	// #region Webhook
	// + --------------------------------------------------------------------------- +
	const form = document.querySelector("form");
	const url = window.location.href;

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		let result = lookupUser($("#myForm").serialize());
		if(result == 'failure') {
			authFailure();
		} else {
			$.ajax({
				url: "https://hooks.zapier.com/hooks/catch/3720110/bemsyjp/",
				type: "post",
				data: $("#myForm").serialize() + "&url=" + encodeURIComponent(url)
																			 + "&genCode=" + encodeURIComponent(generateReferalCode()),
				success: function() {
					authSuccess();
					//window.location = "http://google.com";
				}
			});
		};
	 });  
	// #endregion
	// + --------------------------------------------------------------------------- +

	// + --------------------------------------------------------------------------- +
	// #region Form Data Filtering
	// + --------------------------------------------------------------------------- +
	function formatFormData(str) {
		let input = decodeURIComponent(str.replace(/%2F/g, " "));
		let formData = [];

		input.split('&').forEach(e => formData.push([e.split('=')[0],e.split('=')[1]]));
		return formData;
	}
	// #endregion
	// + --------------------------------------------------------------------------- +

	// + --------------------------------------------------------------------------- +
	// #region Retrieve Sheet Data
	// + --------------------------------------------------------------------------- +
	const sheetID = '1SaB0r_8Y4aO1i7_XH4uv8z6gzOd9BGytgxP-JM22NpY';
	const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
	const sheetName = 'Database';
	const query = encodeURIComponent('Select *');
	const sheetUrl = `${base}&sheet=${sheetName}&tq=${query}`;
	const data = [];

	document.addEventListener('DOMContentLoaded', init);
	function init() {
		fetch(sheetUrl)
		.then(res => res.text())
		.then(rep => {
			const jsData = JSON.parse(rep.substr(47).slice(0,-2));
			const colz = [];
			jsData.table.cols.forEach((heading) => {
				if(heading.label) {
					colz.push(heading.label.toLowerCase().replace(/\s/g,''));
				};
			});
			jsData.table.rows.forEach((main) => {
				const row = {};
				colz.forEach((ele, ind) => {
					row[ele] = (main.c[ind] != null) ? main.c[ind].v : '';
				});
				data.push(row);
			});
		});
		console.log(data);
	};
	// #endregion
	// + --------------------------------------------------------------------------- +

	// + --------------------------------------------------------------------------- +
	// #region Authentication
	// + --------------------------------------------------------------------------- +
	function lookupUser(str) {
		let userData = formatFormData(str); // fullname, phone, email & referralCode
		let result = 'failure';
		console.log(data);
		for(let i = 0, n = data.length; i < n; i++){ // for has way better performance and since I'm working with a huge chunk of data, why not. Also, call data.length just once.
					if(data[i].phonenumber  ==  userData[1][1] || data[i].email ==  userData[2][1]) {
						result = 'failure';
						console.log("You're already subscribed.");
					} else {
						result = 'success';
					}
			};
		return result;
	}

	function authSuccess() {
		showCode();

		let thankyouDiv = document.querySelector('.c-thankyou');
		let form = document.querySelector('form');

		thankyouDiv.classList.add(`c-thankyou-active`);
		form.style.display = "none";
	};

	function authFailure() {
		let warningDiv = document.querySelector('.u-warning');
		warningDiv.classList.add('u-warning-active');
	}

	function generateReferalCode() {
		let d = new Date();
		return `${d.getDate()}${d.getDay()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}`
	};

	function showCode() {
		document.getElementById('genCode').innerText = generateReferalCode();
	};
	// #endregion
	// + --------------------------------------------------------------------------- +
