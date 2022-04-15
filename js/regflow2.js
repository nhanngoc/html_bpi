var Webflow = Webflow || [];
Webflow.push(function() {
	Date.prototype.yyyymmddhhmmss = function() {
		var yyyymmddhhmm = this.yyyymmddhhmm();
		var ss = this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds();
		return ''.concat(yyyymmddhhmm).concat(ss);
	};
	gtag('event', 'conversion', {
		'allow_custom_scripts': true,
		'send_to': 'DC-8387517/202200/2022000+standard'
	});	
	const $form = $('form');
	var container = $form.parent();
	var doneBlock = $('.w-form-done', container);
	var failBlock = $('.w-form-fail', container);
	$('[id*=country_code]').change(function() {
		const code = $(this).val();
		console.log(code, $('.province-dd'));
		if (code === '86') $('.province-dd').show();
		else $('.province-dd').hide();
	});
	// check tnc checkbox value
	$('[id*=tnc]').attr('value', 'yes');
	$('[id*=noCommPref]').change(function() {
		if (this.checked) {
			$('input[name*="commPref"]').each(function() {
				$(this).prop('checked', false);
			});
			$('.comm-pref-blocks').hide();
			$('.comm-pref-checkboxes').hide();
		} else {
			$('.comm-pref-blocks').show();
			$('.comm-pref-checkboxes').show();
		}
	});
	$('input[name*="commPref"]').on('click', function() {
		$('[id*=noCommPref]').prop('checked', false);
	});
	let checkStatus = function(resultData) {
		console.log(resultData);
		switch (resultData.status) {
			case 1:
				return {
					success: true
				};
			case -2:
			case -3:
			case -4:
			case -5:
			case -6:
			case -7:
				return {
					success: false,
					error: resultData.error
				};
		}
	};
	let handleError = function(e) {
		console.log(e);
	};
	$.validator.addMethod('letters', function(value, element) {
		return this.optional(element) || value === value.match(/^[a-zA-Z\s]*$/);
	});
	$.validator.addMethod(
		'customlength',
		function(value, element) {
			return this.optional(element) || value.length === ($('#country_code').val() === '86' ? 11 : 8);
		},
		function(params, element) {
			return 'Contact number should be in ' + ($('#country_code').val() === '86' ? 11 : 8) + ' digit.';
		}
	);
	// 20211025 added by victoria
	$.validator.methods.email = function( value, element ) {
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		return this.optional( element ) || emailReg.test( value );
	};
	$.validator.addMethod(
		'requiredByCountryCode',
		function(value, element) {
			console.log($('#country_code').val());
			return this.optional(element) || $('#country_code').val() === '86' ? value.length > 0 : true;
		},
		'Province is required.'
	);
	$.validator.addMethod(
		'comm-pref',
		function(value) {
			return $('#noCommPref').prop('checked') || $('.comm-pref:checked').length > 0;
		},
		'Please pick one or more communications preference.'
	);
	var checkboxes = $('.comm-pref');
	var checkbox_names = $.map(checkboxes, function(e, i) {
		return $(e).attr('name');
	}).join(' ');
	
	console.log(checkbox_names);

	async function fetchWithTimeout(resource, options) {
		const { timeout = 5000 } = options;
		
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeout);
	  
		const response = await fetch(resource, {
		  ...options,
		  signal: controller.signal  
		});
		clearTimeout(id);
	  
		return response;
	 }
	let outreachRegProxyCount = 0;
	let delayFirstTime = true;
	let outreachRegProxy = async function(formdata) {
		let urlParams = new URLSearchParams(window.location.search);
		const delay = urlParams.get('delay');		
		const endPoint = delay && delayFirstTime ? 'OutreachRegDelay.php' : 'OutreachReg.php';
		console.log('endPoint: ', endPoint, delay, delayFirstTime);
		if (delay) delayFirstTime = false;

		var mode = ''; // live/;
		var apiURL = 'https://pmcloud.pixelsmagic.com/serge-lutens-digital-consultation-table/local-service/api/proxy/v2/' + mode + endPoint;
		console.log(apiURL);
		console.log(formdata);
		var params = new URLSearchParams();
		for (let i in formdata) {
			params.append(i, formdata[i]);
		}

		try {
			const response = await fetchWithTimeout(apiURL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: params,
			  	timeout: 5000
			});
			
			// console.log(response);
			if (!response.ok) {
				// outreachRegProxy(formdata);
				outreachRegProxyCount++;
				// if (outreachRegProxyCount < 5) {
					// outreachRegProxy(formdata);
				// } else {
					return {
						RegResult: [ { Brand: '', VIPCode: '', MsgErr: 'Network Down! Please Try again', Msg: '' } ],
						Status: '-1'
					};
				// }												
			} else {
				const data = await response.json();
				return {...data, Status: 1};
			}

		  } catch (error) {
			// Timeouts if the request takes
			// longer than 6 seconds
			//
			outreachRegProxyCount++;
			// if (outreachRegProxyCount < 5) {
				// outreachRegProxy(formdata);
			// } else {				
				return {
					RegResult: [
						{ Brand: '', VIPCode: '', MsgErr: 'Network Down! Please Try again', Msg: '', ToOutage: 'true' }
					],
					Status: '-1'
				};
			// }	
		  }
		/*
		return fetch(apiURL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: params
		})
			.then((response) => {
				console.log(response);
				if (!response.ok) {
					return {
						RegResult: [ { Brand: '', VIPCode: '', MsgErr: 'Network Down! Please Try again', Msg: '' } ]
					};
				} else {
					return response.json();
				}
			})
			.then((result) => result)
			.catch((error) => {
				return {
					RegResult: [
						{ Brand: '', VIPCode: '', MsgErr: 'Network Down! Please Try again', Msg: '', ToOutage: 'true' }
					]
				};
			});
		*/
	};

	$form.validate({
		errorPlacement: function(error, element) {
			if (element.attr('name') == 'radios') {
				error.insertAfter('.salutation .w-col:first-child .form-label');
			} else if (element.attr('name') == 'choice_1') {
				error.insertAfter('.sample-choice .w-col:first-child .form-label');
			} else if (element.attr('name') == 'redemption') {
				error.insertAfter('.redemption-locations .text-block-9');
			} else if (element.attr('name') == 'pickup_date') {
				error.insertAfter('.pickup-date .form-label');
			} else if (element.attr('name').includes('commPref')) {
				error.insertBefore('.comm-pref-blocks');
			} else if (element.attr('name') == 'tnc') {
				error.insertBefore('.tnc-block');
			} else {
				error.insertAfter(element);
			}
		},
		groups: {
			commPrefs: checkbox_names
		},
		rules: {
			choice_1: {
				required: true
			},
			radios: {
				required: true
			},
			last_name: {
				required: true
			},
			first_name: {
				required: true
			},
			age_range: {
				required: true
			},
			country_code: {
				required: true
			},
			contact_number: {
				required: true,
				number: true,
				customlength: true
			},
			province: {
				requiredByCountryCode: true
			},
			email: {
				required: true,
				email: true
			},
			pickup_date: {
				required: true
			},
			redemption: {
				required: true
			},
			tnc: {
				required: true
			}
		},
		messages: {
			choice_1: {
				required: 'Please select one of the samples.'
			},
			radios: {
				required: 'Please select your saluation.'
			},
			last_name: {
				required: 'Please specify your last name'
			},
			first_name: {
				required: 'Please specify your first name'
			},
			age_range: {
				required: 'Please select your age range'
			},
			country_code: {
				required: 'Please select the country code'
			},
			contact_number: {
				required: 'Please enter your contact number',
				number: 'Only number is allow'
			},
			email: {
				required: 'Please enter your email',
				email: 'Email is invalid'
			},
			pickup_date: {
				required: 'Please select a appointment date'
			},
			redemption: {
				required: 'Please select a redemption location'
			},
			tnc: {
				required: 'Please agree to the below statement'
			}
		},
		submitHandler: function(form) {
			
			var action = $form.attr('action');
			var method = $form.attr('method');
			var data = $form.serialize();
			$form.css({
				opacity: 0.4,
				'pointer-events': 'none',
				'touch-action': 'none'
			});
			$.ajax({
				type: method,
				url: action + '?_=' + new Date().getTime(),
				data: data,
				dataType: 'json',
				cache: false,
				success: async function(resultData) {
					if (typeof checkStatus === 'function') {
						// call custom callback
						result = checkStatus(resultData);
						console.log(result);
						if (!result.success) {
							// show error (fail) block
							failBlock.find('.form-error-msg').html(result.error);
							$form.removeAttr('style');
							$form.show();
							doneBlock.hide();
							failBlock.show();
							$('html, body').animate(
								{
									scrollTop: $('#register-sample').offset().top
								},
								2000
							);
							return;
						}
					}

					const regrefid = resultData.data['regrefid'];
					const language = resultData.data['preferlang'] === '2' ? 'en' : 'zh';
					// outreachRegProxy(resultData.data).then((result) => {
					const outReachResult = await outreachRegProxy(resultData.data);					
					if (outReachResult.Status < 0 ) {												
						failBlock.find('.form-error-msg').html(outReachResult.RegResult[0].MsgErr);
						$form.removeAttr('style');
						$form.show();
						doneBlock.hide();
						failBlock.show();
						$('html, body').animate(
							{
								scrollTop: $('#register-sample').offset().top
							},
							2000
						);
						return;
					}					
					$.ajax({
						type: method,
						url: './templib/send-email.php?_=' + new Date().getTime(),
						data: {
							regrefid: regrefid,	
							language: language
						},
						dataType: 'json',
						cache: false,
						success: function(resultData) {
							console.log(resultData);
							// show success (done) block
							gtag('event', 'conversion', {
								'allow_custom_scripts': true,
								'send_to': 'DC-8387517/202200/20220001+standard'
							});							
							/**/
							$form.removeAttr('style');
							$form.hide();
							$('.reminder').hide();
							doneBlock.show();
							failBlock.hide();
							$('html, body').delay(400).animate(
								{
									scrollTop: $('#register-sample').offset().top
								},
								2000
							);								
						},
						error: function(e) {
							// call custom callback
							if (typeof handleError === 'function') {
								handleError(e);
							}
							// show error (fail) block
							$form.removeAttr('style');
							$form.show();
							doneBlock.hide();
							failBlock.show();
							$('html, body').animate(
								{
									scrollTop: $('#register-sample').offset().top
								},
								2000
							);
						}
					});	
						
					// });
				},
				error: function(e) {
					// call custom callback
					if (typeof handleError === 'function') {
						handleError(e);
					}
					// show error (fail) block
					$form.removeAttr('style');
					$form.show();
					doneBlock.hide();
					failBlock.show();
					$('html, body').animate(
						{
							scrollTop: $('#register-sample').offset().top
						},
						2000
					);
				}
			});
		}
	});
});