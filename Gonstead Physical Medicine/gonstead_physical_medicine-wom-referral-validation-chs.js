'use strict'

	// + --------------------------------------------------------------------------- +
	// #region Webhook
	// + --------------------------------------------------------------------------- +
	const form = document.querySelector("form");
	const url = window.location.href;

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		let result = lookupUser($("#myForm").serialize());
		if(result[0] == 'failure') {
			authFailure();
		} else {
			$.ajax({
				url: "https://hooks.zapier.com/hooks/catch/3720110/bx16pec/",
				type: "post",
				data: $("#myForm").serialize() + "&url=" + encodeURIComponent(url) + "&refererName=" + encodeURIComponent(JSON.parse(result[1])['Referer Name'])
																			 + "&refererPhone=" + encodeURIComponent(JSON.parse(result[1])['Referer Phone'])
																			 + "&refererEmail=" + encodeURIComponent(JSON.parse(result[1])['Referer Email'])
																			 + "&refererCredit=" + encodeURIComponent(JSON.parse(result[1])['Referer Credit']),
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
	// #region Authentication
	// + --------------------------------------------------------------------------- +
	function lookupUser(str) {
		let userData = formatFormData(str); // fullname, phone, email & referralCode
		let result = 'failure';
		let referal = 'none';
		for(let i = 0, n = data.length; i < n; i++){ // for has way better performance and since I'm working with a huge chunk of data, why not. Also, call data.length just once.
			if(data[i].phonenumber  ==  userData[1][1] || data[i].email ==  userData[2][1]) {result = 'failure'; return [result, referal];}
			if(data[i].code == userData[3][1]) {
				referal = "{\"Referer Name\": \"" +data[i].fullname +"\", "
										+ "\"Referer Phone\": \"" +data[i].phonenumber+"\" , "
										+ "\"Referer Email\": \"" +data[i].email+"\" , "
										+ "\"Referer Credit\": \"" +data[i].credit+"\"}";
				result = 'success';
				return [result, referal];
			}
		};
		return [result, referal];
	};
	
	function authSuccess() {
		let warningDiv = document.querySelector('.u-warning');
		let thankyouDiv = document.querySelector('.c-thankyou');
		let form = document.querySelector('form');

		warningDiv.classList.remove('u-warning-active');
		thankyouDiv.classList.add(`c-thankyou-active`);
		form.style.display = "none";
	}

	function authFailure() {
		let warningDiv = document.querySelector('.u-warning');
		warningDiv.classList.add('u-warning-active');
	}
	// #endregion
	// + --------------------------------------------------------------------------- +
