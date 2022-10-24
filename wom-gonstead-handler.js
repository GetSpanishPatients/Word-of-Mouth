'use strict'

  //Strict use for handling users claiming their credits.
  //Incorrect/Lack of use of this application will result in unseen and incorrect behaviour. We are not responsible for user's mistakes.

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
				url: "https://hooks.zapier.com/hooks/catch/3720110/b06hp8r/",
				type: "post",
				data: $("#myForm").serialize() + "&url=" + encodeURIComponent(url) + "&refererName=" + encodeURIComponent(JSON.parse(result[1])['Referer Name'])
																			 + "&refererPhone=" + encodeURIComponent(JSON.parse(result[1])['Referer Phone'])
																			 + "&refererEmail=" + encodeURIComponent(JSON.parse(result[1])['Referer Email'])
																			 + "&postReductionCredit=" + encodeURIComponent(JSON.parse(result[1])['Credit Post Reduction'])
																			 + "&excelRow=" + encodeURIComponent(JSON.parse(result[1])['Excel Row'])
																			 + "&referralsList=" + encodeURIComponent(JSON.parse(result[1])['Referrals List']),
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
	};
	// #endregion
	// + --------------------------------------------------------------------------- +

	// + --------------------------------------------------------------------------- +
	// #region Authentication
	// + --------------------------------------------------------------------------- +
	function lookupUser(str) {
		let userData = formatFormData(str); // fullname, phone, email & referralCode
		let result = 'failure';
		let referal = 'none';
		let creditClaimAmmount = 10 // DEVELOPER NOTE: Reduce the necessary credit manually here. ALWAYS update the code when the
																// clinic updates their offer.
		for(let i = 0, n = data.length; i < n; i++){
			if(data[i].phonenumber  ==  userData[1][1])	{
				let credit = data[i].credit - creditClaimAmmount; 
				referal = "{\"Referer Name\": \"" +data[i].fullname +"\", "
				+ "\"Referer Phone\": \"" +data[i].phonenumber+"\" , "
				+ "\"Referer Email\": \"" +data[i].email+"\" , "
				+ "\"Credit Post Reduction\": \"" +credit+"\" , "
				+ "\"Excel Row\": \"" +data[i].row+"\" , "
				+ "\"Referrals List\": \"" +data[i].referrals+"\"}";
				result = "success";
				return [result, referal];
			}
		};
		return [result, referal];
	};

	function authSuccess() {
		let thankyouDiv = document.querySelector('.c-thankyou');
		let form = document.querySelector('form');

		thankyouDiv.classList.add(`c-thankyou-active`);
		form.style.display = "none";
	};

	function authFailure() {
		let warningDiv = document.querySelector('.u-warning');
		warningDiv.classList.add('u-warning-active');
	};
	// #endregion
	// + --------------------------------------------------------------------------- +

