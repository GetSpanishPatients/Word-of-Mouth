'use strict'

	// + --------------------------------------------------------------------------- +
	// #region Webhook
	// + --------------------------------------------------------------------------- +
	const form = document.querySelector("form");
	const url = window.location.href;

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		let result = lookupUser($("#myForm").serialize());
		switch(result[0]){
			case 'failure':
				authFailure();
				break;
			case 'redeemed':
				authFailureRedeemed();
				break;
			case 'not found':
				authFailureNotFound();
				break;
			case 'success':
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
				break;
			default:
					alert("Something went wrong!");
				break;
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
		let userData = formatFormData(str); // fullname, phone
		let result = 'failure';
		let referal = 'none';
		let creditClaimAmmount = 10 // DEVELOPER NOTE: Reduce the necessary credit manually here. ALWAYS update the code when the
																// clinic updates their offer.
		for(let i = 0, n = data.length; i < n; i++){
			if (data[i].phonenumber  ==  userData[1][1] && !isRedeemContactValid(data[i].referrals)) {
				result = 'not found';
				return [result, referal];
			}

			if(data[i].phonenumber  ==  userData[1][1] && isCreditUnclaimed(data[i].referrals))	{
				let credit = data[i].credit - creditClaimAmmount;
				let referralList = stringifyReferralData(data[i].referrals);

				referal = "{\"Referer Name\": \"" +data[i].fullname +"\", "
				+ "\"Referer Phone\": \"" +data[i].phonenumber+"\" , "
				+ "\"Referer Email\": \"" +data[i].email+"\" , "
				+ "\"Credit Post Reduction\": \"" +credit+"\" , "
				+ "\"Excel Row\": \"" +data[i].row+"\" , "
				+ "\"Referrals List\": \"" +referralList+"\"}";
				result = "success";

				return [result, referal];
			} 
			
			if (data[i].phonenumber  ==  userData[1][1] && !isCreditUnclaimed(data[i].referrals)) {
				result = 'redeemed';
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
		let warningDivRedeemed = document.querySelector('.u-warning_redeem');
		let warningDiv404 = document.querySelector('.u-warning_404');
		warningDiv.classList.add('u-warning-active');
		warningDivRedeemed.classList.remove('u-warning_redeem-active');
		warningDiv404.classList.remove('u-warning_404-active');
	};

	function authFailureRedeemed() {
		let warningDivRedeemed = document.querySelector('.u-warning_redeem');
		let warningDiv = document.querySelector('.u-warning');
		let warningDiv404 = document.querySelector('.u-warning_404');
		warningDivRedeemed.classList.add('u-warning_redeem-active');
		warningDiv.classList.remove('u-warning-active');
		warningDiv404.classList.remove('u-warning_404-active');
	};

	function authFailureNotFound() {
		let warningDiv404 = document.querySelector('.u-warning_404');
		let warningDivRedeemed = document.querySelector('.u-warning_redeem');
		let warningDiv = document.querySelector('.u-warning');
		warningDiv404.classList.add('u-warning_404-active');
		warningDivRedeemed.classList.remove('u-warning_redeem-active');
		warningDiv.classList.remove('u-warning-active');
	};

	// + --------------------------------------------------------------------------- +
	// #region Excel
	// + --------------------------------------------------------------------------- +
	function formatReferralData(db) {
		const referredData = db; // retrieve data from excel
		const referrals = referredData.split(','); // create an array from the tags
		let dataReferred = [];
	
		referrals.forEach(function(element) {
			dataReferred.push(element.split('/'));
		});

		return dataReferred;
	};

	function isRedeemContactValid(db) {
		const referredData = formatReferralData(db); // excel data
		let referredPhone = $("#myForm").serializeArray()[3].value; //form data

		for(let i = 0, n = referredData.length; i < n; i++) {
			if (referredData[i][1] == referredPhone) return true;
		};

		return false;
	};

	function isCreditUnclaimed(db) {
		const referredData = formatReferralData(db); // excel data
		let referredPhone = $("#myForm").serializeArray()[3].value; //form data

		for(let i = 0, n = referredData.length; i < n; i++) {
			if (referredData[i][1] == referredPhone && referredData[i][2] === '(unclaimed)') return true;
		};

		return false;
	};

	function stringifyReferralData(array) {
		const referredData = findRedeemed(array);
		let items = [];

		referredData.forEach((element) => {
			items.push(element.join('/'));
		});

		return items.join(',');
	};

	function findRedeemed(db) {
		const referredData = formatReferralData(db); // excel data
		let referredPhone = $("#myForm").serializeArray()[3].value; //form data

		for(let i = 0, n = referredData.length; i < n; i++) {
			if (referredData[i][1] == referredPhone){
				referredData[i][2] = '(redeemed)';
				return referredData;
			};
		};

		return referredData;
	}
	// #endregion
	// + --------------------------------------------------------------------------- +

