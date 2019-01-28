const ENVIRONMENTS = {
    'production': 'production',
    'staging': 'staging'
};
const ENVIRONMENT = ENVIRONMENTS.production;

var browserInfo = function() {
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var nameOffset,verOffset,ix;
	var b = {
		browserName: navigator.appName,
		fullVersion: ''+parseFloat(navigator.appVersion),
		majorVersion: parseInt(navigator.appVersion,10)
	};

	// In Opera 15+, the true version is after "OPR/" 
	if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
	 b.browserName = "Opera";
	 b.fullVersion = nAgt.substring(verOffset+4);
	}
	// In older Opera, the true version is after "Opera" or after "Version"
	else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 b.browserName = "Opera";
	 b.fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   b.fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 b.browserName = "Microsoft Internet Explorer";
	 b.fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 b.browserName = "Chrome";
	 b.fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 b.browserName = "Safari";
	 b.fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   b.fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 b.browserName = "Firefox";
	 b.fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
	          (verOffset=nAgt.lastIndexOf('/')) ) 
	{
	 b.browserName = nAgt.substring(nameOffset,verOffset);
	 b.fullVersion = nAgt.substring(verOffset+1);
	 if (b.browserName.toLowerCase()==b.browserName.toUpperCase()) {
	  b.browserName = navigator.appName;
	 }
	}
	// trim the b.fullVersion string at semicolon/space if present
	if ((ix=b.fullVersion.indexOf(";"))!=-1)
	   b.fullVersion=b.fullVersion.substring(0,ix);
	if ((ix=b.fullVersion.indexOf(" "))!=-1)
	   b.fullVersion=b.fullVersion.substring(0,ix);

	b.majorVersion = parseInt(''+b.fullVersion,10);
	if (isNaN(b.majorVersion)) {
	 b.fullVersion  = ''+parseFloat(navigator.appVersion); 
	 b.majorVersion = parseInt(navigator.appVersion,10);
	}

	return b;
};

jQuery(document).ready(function($) {
	
	//$(".app-video .video-js-box").fitVids({customSelector:'video'});

	// highlighting the arrows on the FAQ page
	$('.list-group-item').on('click', function() {
		if( $(this).hasClass('selected') ) {

			$(this).removeClass('selected').parent()
					.find('.fa-angle-up')
					.removeClass('fa-angle-up')
					.addClass('fa-angle-down');
			$(this).find('.icon-wrapper').css({'background' : '#69768d'});

		} else {

			$(this).addClass('selected').parent().find('.fa-angle-up')
					.removeClass('fa-angle-up')
					.addClass('fa-angle-down');

			$(this).find('.icon-wrapper').css({'background' : '#00b08d'})
					.find('.fa-angle-down')
					.removeClass('fa-angle-down')
					.addClass('fa-angle-up');
			$(this).siblings().removeClass('selected').find('.icon-wrapper').css({'background' : '#69768d'})
		}
	});

	//toggle class for mobile bootstrap button
	$(".navbar-toggle").on("click", function () {
	    $("#bs-example-navbar-collapse-1").toggleClass("collapse");
    });

	// greeting text type on the mainpage
	$('#greeting-type').typed({
		strings: ['lära dig matten', 'få mer tid över till annat', 'nå högre betyg!'],
		loop: true,
		backDelay: 1000,
		typeSpeed: 100
	});

	$(window).resize(function() {
		adaptiveBlocks();
	});
	adaptiveBlocks();

	// slide carousel
	$('.owl-carousel').owlCarousel({
		items: 1,
		loop: true,
		dotsEach: true,
		autoplay: false
	});

	// Load video async.
	setTimeout(function() {
		// $("#videoPreviewThumb").remove();
		// $("#videoContainer").append($('<iframe src="https://player.vimeo.com/video/181943849" width="640" height="360" frameborder="0" allowfullscreen></iframe>'));
		// // adaptive video size on
		// fitvids();
	},500);

	// Safari style override
	if( browserInfo().browserName == "Safari" ) {
		$("#loginPanel").css("margin-right", "30px");
	}

	console.log("all.js version 0.1");
});
// fadein of payment modal in navbar menu

//adaptive blocks
function adaptiveBlocks() {
	jQuery(document).ready(function($){
		var videoHeight = $('.app-video').height();
		var windowWidth = $(window).width();
		if(windowWidth < 753) {
			$('.app-section').css({'height' : 'inherit'})
			$('.benefit-wrapper').addClass('owl-carousel').owlCarousel({items: 1,loop: true,dotsEach: true,autoplay: false});
		} else {
			$('.benefit-wrapper.owl-carousel').trigger('destroy.owl.carousel');
			$('.benefit-wrapper').removeClass('owl-carousel');
		}
		if(windowWidth < 977) {
			$('.app-video').detach().insertAfter('.app-section .container');
			$('.social-links').detach().insertAfter('.pages-list-wrapper')
		} else {
			$('.app-section').height(videoHeight);
			$('.social-links').detach().insertAfter('footer .app-links')
		}
		/*if(windowWidth > 1400) {
			$('.container').removeClass('container').addClass('container-fluid');
		} else {
			$('.container-fluid').removeClass('container-fluid').addClass('container');
		}*/

		// SVG for Safari IPhone
		if(windowWidth > 1000) {
			$('.need-image img').css({
				'width' : '800px',
				'height' : '516px'
			});
			$('.register-image img').css({
				'width' : '294px',
				'height' : '497px'
			});
		/*} else if (windowWidth < 768) {
            var offset = $('#sticky-header').offset();
            $(window).scroll(function(){
                $('#sticky-header').addClass('fixed-header');
                if($(document).scrollTop() < 1){
                    $('#sticky-header').removeClass('fixed-header');
                }
            });*/
        } else if (windowWidth < 487) {
			$('.need-image img').css({
				'width' : '310px',
				'height' : '257px'
			});
			$('.register-image img').css({
				'width' : '158px',
				'height' : '268px'
			});
		}
	});
}

function showPayment() {
	jQuery(function($) {
		$('.modal-card-payment').fadeIn(1000).siblings().css('display', 'none');
	});
}

var changePlanPage;
jQuery(document).ready(function($) {
	var nrPlanPages = 10;
	changePlanPage = function(nr) {
		for( var i=1; i < nrPlanPages+1; i++ ) {
			$("#plan-" + i).hide();
		}
		$("#plan-" + nr).show();
	}
	if( $("#plan-1").length > 0 ) {
		changePlanPage(1);
	}
});






