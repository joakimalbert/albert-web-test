/**
 * Created by pavel on 10/3/16.
 * Altered by HarinderSinghDeepak on 12/21/18
 */
var SITE_URL = window.location.origin;

var gBackendBase = ENVIRONMENT === ENVIRONMENTS.production
    ? 'https://albert-receipt-auth.herokuapp.com'
    : 'https://albert-be-sandbox.herokuapp.com';

var paymentBackend = SITE_URL+'/api/index.php/';

const DAYS_TO_NOT_SHOW_CANCEL_BUTTON = 60;

var fb_config = {
    apiKey: "AIzaSyA7mRnTpAYBu4fcCUcy0dW3_-97sLmrBxI",
    authDomain: "albert-production.firebaseapp.com",
    databaseURL: "https://albert-production.firebaseio.com",
    projectId: "firebase-albert-production",
    storageBucket: "firebase-albert-production.appspot.com",
    messagingSenderId: "424097132092"
};
    
var fb_config_sandbox = {
    apiKey: "AIzaSyB7nR6P1qr7R2cCB94fQc5SNpyyepLPbtc",
    authDomain: "albert-sandbox.firebaseapp.com",
    databaseURL: "https://albert-sandbox.firebaseio.com",
    projectId: "firebase-albert-sandbox",
    storageBucket: "firebase-albert-sandbox.appspot.com",
    messagingSenderId: "357981576708"
};


var _stripe = null;
var _card = null;

var _stripeObj = null;
var _cardObj = null;

var applicationUrl = 'http://localhost:3000/';
var paymentBackend = SITE_URL+'/api/index.php/';
var currentSiteUsrl = window.location.href;

var userInf = {};
var userInfForLoginEncoded = '';
var registrationFlowOrigin = '';

var gUser = null;
var userEmailReg = '';
var registrationFromParent = '';

jQuery(document).ready(function($)
{
    // Stripe
    $.getScript("https://js.stripe.com/v3/", function() {
        if( $("#payment").length > 0 ) {
            setTimeout(function() {
                _stripeObj = ENVIRONMENT === ENVIRONMENTS.production
                    ? Stripe('pk_live_gNNHdye71kfdXCfefhlSkKHO')
                    : Stripe('pk_test_QMoW1ng2EVc2DScUP6eQdeVQ');
                stripeFormSetup();
            },500);
        }
    });

    ENVIRONMENT === ENVIRONMENTS.production
    ? firebase.initializeApp(fb_config)
    : firebase.initializeApp(fb_config_sandbox);
    
    var isMobile = false; //initiate as false
    // device detection
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

    $('#verifyPinSignup').on('click', function(e) {
        e.preventDefault();
        registerRedeemFormDone($(this).parent('form'));
        return false;
    });    

    $('#letsdeal-btn').on('click', function(e) {
        e.preventDefault();
        // registerLetsDeal($(this).parents('form'));
        return false;
    });

    $('a#sendParentEmail').click(function(){
        saveParentEmail();
    });
    
    $('#signUp, #signUpParent').on('click',function (e) {
        e.preventDefault();
        registerFormDone($(this).parent('form'));

        return false;

    });

    $('.logInBtnHead').on('click', function (e) {
        e.preventDefault();
    });

    $('.logInBtnHead').on('click',function (e) {
        e.preventDefault();
        var loginEmail = $('.loginEmail').val(),
            loginPass = $('.loginPass').val();
        //loginWithPass(loginEmail,loginPass)
    });

    $('.facebook-link').on('click',function (e) {
        e.preventDefault();
        if($(this).parent().hasClass('modal-start-trial')){
            authFacebook('register');
        } else {
            authFacebook();
        }
    });

    $('.google-link').on('click',function (e) {
        e.preventDefault();
        if($(this).parent().hasClass('modal-start-trial')){
            console.log('register');
            authGoogle('register');
        } else {
            authGoogle();
        }
    });

    $('.modal-parent').on('click',function (e) {
        registrationFromParent = true;
        registrationFlowOrigin = 'Parents';
        $('.subscribeMarket').hide();

        fbq('track', 'AddToCart', {
            content_name: 'Foralder'
        });

        ga('send', 'event', {
          eventCategory: 'Cart',
          eventAction: 'AddToCart',
          eventLabel: 'Foralder'
        });

        $('.modal-start-trial-parent').fadeIn(1000).siblings().css('display', 'none');
        // setTimeout(function () {
        //     $('body').addClass('modal-open');
        // },1000);
    });

    $('.modal-students').on('click',function (e) {
        registrationFromParent = true;
        registrationFlowOrigin = 'Students';
        $('.subscribeMarket').show();
        fbq('track', 'AddToCart', {
            content_name: 'Elev'
        });
        $('.modal-start-trial').fadeIn(1000).siblings().css('display', 'none');
        // setTimeout(function () {
        //     $('body').addClass('modal-open');
        // },1000);
    });

    checkIfPurchaseDone();

    checkForRedirectUrl();

    $('.congrats-ok').on('click', function () {
        $('#modal-registrationPr, #modal-registrationSt').modal('hide');
        mobileModalHide();
    });

    $('.schoolCodeSubmit').on('click',function (e) {
        e.preventDefault();
        var schoolFormInp = $(this).parents('form').find('#schoolCodeEnter');
        validateSchoolCode(schoolFormInp[0].value);
        return false;
    });
    

    $('.schoolCodeRegLink').on('click',function (e) {
        e.preventDefault();
        if(isMobile){
            mobileModalSchoolShow();
        } else {
            $("#register-school-login").fadeIn(200);
        }
        return false;
    });

    $("#register-cancel-school").click(function(e) {
        e.preventDefault();
        $("#register-school-login").fadeOut(200);

        return false;
    });


    $('#NewRegTest').on('click',function () {
        mobileShowRegStud()
    })

    $('.modalForMobile .close-modal').on('click',function () {
        /*var modalToClose = $(this).parents('.modalForMobile').attr('id')*/
        mobileModalHide()
    })

    $("#startPeriod").click(function(e) {
        e.preventDefault();
        runStripePayment();
        return false;
    });

    $("#payment-card-nr").on('keyup', function(e) {
        var cVal = $(this).val().replace(/[^0-9]/g,'');
        if( e.keyCode != 9 && e.keyCode != 16 ) {
            if( cVal.length > 15 ) $("#payment-card-month").focus();
            else if( cVal.length > 12 ) $(this).val(cVal.substring(0,4) + " " + cVal.substring(4,8) + " " + cVal.substring(8,12) + " " + cVal.substring(12));
            else if( cVal.length > 8 ) $(this).val(cVal.substring(0,4) + " " + cVal.substring(4,8) + " " + cVal.substring(8,12));
            else if( cVal.length > 4 ) $(this).val(cVal.substring(0,4) + " " + cVal.substring(4,8));
            else $(this).val(cVal);
        }
    });

    $("#payment-card-month").on('keyup', function(e) {
        if( e.keyCode != 9 && e.keyCode != 16 ) {
            var cVal = $(this).val().replace(/\s/g,'');
            if( cVal.length > 1 ) $("#payment-card-year").focus();
        }
    });
    $("#payment-card-year").on('keyup', function(e) {
        if( e.keyCode != 9 && e.keyCode != 16 ) {
            var cVal = $(this).val().replace(/\s/g,'');
            if( cVal.length > 1 ) $("#payment-card-cvc").focus();
        }
    });

    $("#payment-card-cvc").on('keyup', function(e) {
        if( e.keyCode == 13 ) {
            e.preventDefault();
            runStripePayment();
            return false;
        }
    });

    $("#phoneRedeem").on('keypress', function(e)
    {
        if( e.keyCode == 13 ) {
            e.preventDefault();
            registerRedeemFormDone($(this).parent('form'));
        }
    });

    $("#pincode").on('keypress', function(e)
    {
        if( e.keyCode == 13 ) {
            e.preventDefault();
            registerRedeemFormDone($(this).parent('form'));
        }
    });
    

    $("#phoneSignUp").on('keyup', function(e) {
        e.preventDefault();
        if( e.keyCode == 13 ) {
            registerFormDone($(this).parent('form'));
        }
        else if( (e.keyCode > 36 && e.keyCode < 41) || e.keyCode == 8 ) {
            return true;
        }
        var pushCarPos = e.target.selectionStart;
        var cVal = $(this).val().replace(/[^0-9]/g,'');
        if( cVal.length > 8 ) $(this).val(cVal.substring(0,3) + " " + cVal.substring(3,6) + " " + cVal.substring(6,8) + " " + cVal.substring(8,10));
        else if( cVal.length > 6 ) $(this).val(cVal.substring(0,3) + " " + cVal.substring(3,6) + " " + cVal.substring(6));
        else if( cVal.length > 3 ) $(this).val(cVal.substring(0,3) + " " + cVal.substring(3));
        else $(this).val(cVal);
        e.target.selectionStart = pushCarPos+1;
        e.target.selectionEnd = pushCarPos+1;
        return false;
    });

    $("#schoolInfoSubmit").click(function(e) {
        e.preventDefault();

        var email = $("#fieldEmail").val();
        var phone = $("#fieldPhone").val();

        $("#schoolInfoSubmit").prop("disabled","disabled");
        $("#schoolInfoSubmit").css("background-color", "#f0f0f0");

        $.get(paymentBackend + 'school_interest/' + email + "/phone/" + phone, function(response) {
            $("#newsletter-success").fadeIn(500);
        });

        fbq('track', 'Lead');
        ga('send', 'Lead');

        return false;
    });

    $("form").bind("keypress", function(e) {
        if (e.keyCode == 13) {
            return false;
        }
    });



    $("#fieldEmail").on('keyup', function(e) {
        verifyTeacherForm();
    });

    $("#fieldPhone").on('keyup', function(e) {
        verifyTeacherForm();
    });

    $("#signUpStudent_A").click(function(e) {
        var errors = 0;
        var phoneParent = $("#phoneParent").val();
        var phoneStudent = $("#phoneStudent").val();
        var nameStudent = $("#nameStudent").val();
        var nameParent = "";
        if( $("#nameParent").length > 0 ) nameParent = $("#nameParent").val();

        // Validate
        if( nameStudent.length < 2 || nameParent.length < 2 ) {
            $('#errormsg').html('Du måste ange både ditt namn och din Mamma eller Pappas namn<br/>');
            errors++;
        }
        if( phoneParent.replace(/[^\d]/g,'').length < 10 ||
            phoneParent.substring(0,2) != "07" || 
            phoneStudent.replace(/[^\d]/g,'').length < 10 ||
            phoneStudent.substring(0,2) != "07" ) {

            $('#errormsg').html('Angivna mobilnummer är skrivet i felformat. Rätt format är 07xxxxxxxx<br/>');
            errors++;
        }

        if( errors == 0 ) {
            $.post(gBackendBase + '/askParentsWeb',
                {
                    "phoneNumberParents":phoneParent,
                    "phoneNumberUser":phoneStudent,
                    "childsName":nameStudent,
                    "parentsName":nameParent
                },
                function(response) {
                    if( response.success == "Sms sent" ) {
                        window.location.href = "/sms-skickat";
                    }
                    else {
                        $("#errormsg").html("SMS kunde inte skickas, kontrollera telefonnumret.");
                    }
            });
        }
    });



    $("#phoneParent").on('keyup', function(e) {
        phonenrFix(e);
        return false;
    });

    $("#phoneStudent").on('keyup', function(e) {
        phonenrFix(e);
        return false;
    });



    $(document).on('click', '#pauseSubscriptionButton', function(){
        pasueSub(function() {
            $("body").css('cursor','');
        });
    });

    var pasueSub = function (callback){
        var customer = $("#current-stripe-customer").val();
        var uid = $("#cuid").val();

        $('#loadingGif').css('display', 'block');
        $('#pauseSubscriptionButton').css('display', 'none');
        $.post(paymentBackend + "pausePlan", {stripeCustomer: customer, userId : uid}, function(r) {
            if( r.toString().trim() == "OK" ) {
                $.post(SITE_URL+"/api/process.php", {userId : uid}, function(retData) {
                    var res = JSON.parse(retData);
                    if(res.status == "ok")
                    {
                        changePlanPage(10);
                    }
                    else {
                        alert("Något gick fel, kontakta suporten");
                    }
                });
            }
            else {
                alert("Något gick fel, kontakta suporten");
            }
        })
        .fail(function(r) {
            alert("Något gick fel, kontakta suporten");
        });
    }

    var endSubscription = function(callback) {
        var uid = $("#cuid").val();
        var customer = $("#current-stripe-customer").val();
        $.post(paymentBackend + "cancelPlan", {stripeCustomer: customer}, function(r) {
            if( r.toString().trim() == "OK" ) {
                firebase.database().ref('/users/'+uid).update({
                    cancel: {
                        reason: parseInt($("input[name='whyEndRadio']:checked").val()),
                        remark: $("#other_reason").val(),
                        time: Date.now()
                    }
                });
                changePlanPage(7);
            }
            else {
                alert("Något gick fel, kontakta suporten");
            }
            callback();
        })
        .fail(function(r) {
            alert("Något gick fel, kontakta suporten");
        });
    };

    $("#endSubscriptionLink").click(function(e) {
        $("#endSubscriptionLink").hide();
        $("body").css('cursor','wait');
        endSubscription(function() {
            $("body").css('cursor','');
        });
    });

    $("#extendedOfferButton").click(function(e) {
        $("#extendedOfferButton").hide();
        $("#endSubscriptionLink").hide();
        $("body").css('cursor','wait');
        var customer = $("#current-stripe-customer").val();
        $.post(paymentBackend + "extendOffer", {stripeCustomer: customer}, function(r) {

            $("body").css('cursor','');
            // Relay back to prenumeration start-page
            window.location.reload();
        });
    });

    $("#endSubscriptionButton").click(function(e) {
        var why = parseInt($("input[name='whyEndRadio']:checked").val());
        switch(why) {
            case 1:
                $("#anti-churn-h").html("Visste du att...");
                $("#anti-churn-p").html("Vi har utvecklat funktionalitet i Albert för att ge lika bra läroupplevelse oberoende av vilken bok man har i skolan? Vill ni istället få årskursanpassat material, så hjälper vi gärna till med detta. Väljer du att ta del av erbjudandet så kontaktar våra matteexperter er samtidigt som vi bjuder på en hel månad med Premium Läxhjälp! Bra va?");
            break;
            case 2:
                $("#anti-churn-p").html("Jaha, så du har provat på lite svårare matematik än vad du lär dig i skolan? Det är riktigt häftigt! Om du behöver hjälp med matematiken från just den boken du har i din årskurs så vill vi tipsa om den inbyggda chatten som enbart är tillgänglig för våra Premiumanvändare. Där kan du i princip fota vilken uppgift du vill från boken och få skräddarsydd hjälp med den från någon av våra grymma läxhjälpare! Vill du att ta del av erbjudandet och ge chatten en chans så kontaktar våra matteexperter er samtidigt som vi bjuder på en hel månad med Premium Läxhjälp! Bra va?");
            break;
            case 3:
                $("#anti-churn-p").html("Jaha, du läser mer avancerad matematik än vad Albert kan? Coolt! Om du har behöver hjälp med matematiken från just den boken du har i din årskurs (även högre årskurser) så vill vi tipsa om den inbyggda chatten som enbart är tillgänglig för våra Premiumanvändare. Där kan du i princip fota vilken uppgift du vill från boken och få skräddarsydd hjälp med den från någon av våra grymma läxhjälpare! Vill du att ta del av erbjudandet och ge chatten en chans, kontaktar våra matteexperter er samtidigt som vi bjuder på en hel månad med Premium Läxhjälp! Bra va?");
            break;
            case 10:
                $("#anti-churn-p").html("Gud vad pinsamt! Vi är genuint ledsna över er upplevelse, och hoppas att det finns något vi kan göra för att kompensera för det! Vi hade verkligen velat veta vad vi kan göra bättre och/eller annorlunda för att ni skulle ge Albert en till chans. Det vi kan säga är dock att vi just nu arbetar med en ny version av appen som släpps inom ett par veckor. Det kommer höja upplevelsen samtidigt som den innehåller buggfixar! Vill ni ge Albert en ny chans så kan vi bjuda på en hel månad obegränsat Premium! Tacka ja till erbjudandet nedan så aktiverar vi en gratismånad!");
            break;
        }
        if(( why == 8 || why == 1 || why == 2 || why == 3 || why == 10 ) && ! plan.extendedOfferUsed ) {
            changePlanPage(4);
        }
        else {
            // End Subscribtion
            $("#endSubscriptionButton").hide();
            $("body").css('cursor','wait');
            endSubscription(function() {
                $("body").css('cursor','');
            });
        }
    });

    

    $("#updatePaymentButton").click(function(e) {
        $("#updatePaymentButton").hide();
        $("body").css('cursor','wait');
        updateCard(function() {
            changePlanPage(8);
        },
        function() {
            $("#updatePaymentButton").show();
            $("body").css('cursor','');
        });
    });

    $("#changePlanButton").click(function(e) {
        if($("#changePlanButton").hasClass("btn-disabled")) {
            return null;
        }
        var plan_ch = $("input[name='planRadio']:checked").val();
        var expire = parseInt($("#current-plan-expire").val());
        //var msLeft = expire - Date.now();
        //var monthsLeft = Math.round(msLeft / 2635200000); // (ms per month)
        var price = 99;
        var interval = "mån";
        var start = new Date(expire);
        var newplanFriendly = "ALBERT PREMIUM (99 kr/mån)";

        switch(plan_ch) {
            case "sixmonths":
                price = 474;
                interval = "halvår";
                newplanFriendly = "ALBERT PREMIUM (79 kr/mån - 474 kr totalt)";
                break;
            case "year":
                price = 828;
                interval = "år";
                newplanFriendly = "ALBERT PREMIUM (69 kr/mån - 828 kr totalt)";
                break;
        }

        $("#plan-interval").html(interval);
        $(".var-new-plan-price").html(price);
        $(".var-plan-start").html(formatDate(start));
        $(".plan-new-name").html(newplanFriendly);
        //$("#plan-time-left").html(monthsLeft);

        // Move payment form?
        if( plan.canceled || plan.status == "past_due" ) {
            var c = $("#payment-form").detach();
            c.appendTo("#card-placeholder-2");
        }
        else {
            $("#card-2-form").hide();
        }

        // Confirm
        changePlanPage(5);
    });

    $("#cancelLink").click(function(e) {
        // Move payment form back again?
        if( plan.canceled || plan.status == "past_due" ) {
            var c = $("#payment-form").detach();
            c.appendTo("#card-placeholder-1");
        }
        changePlanPage(1);
    });



    $("#changePlanConfirmButton").click(function(e) {
        $("#changePlanConfirmButton").hide();
        $("#cancelLink").hide();
        $("body").css('cursor', 'wait');
        var customer = $("#current-stripe-customer").val();
        var plan_ch = $("input[name='planRadio']:checked").val();
        var newplan = "";
        var newplanFriendly = "";
        var newprice = "99";
        switch(plan_ch) {
            case "month":
                newplan = "1 month";
                newprice = "99";
                newplanFriendly = "ALBERT PREMIUM (99 kr/mån)";
                break;
            case "sixmonths":
                newplan = "6 month";
                newprice = "474";
                newplanFriendly = "ALBERT PREMIUM (79 kr/mån - 474 kr totalt)";
                break;
            case "year":
                newplan = "1 year";
                newprice = "828";
                newplanFriendly = "ALBERT PREMIUM (69 kr/mån - 828 kr totalt)";
                break;
        }

        $("#plan-old-name").html($(".var-plan-name").html());
        $(".plan-new-name").html(newplanFriendly);
        $(".var-plan-new-price").html(newprice);

        // If payment form is visible update that first
        if( plan.canceled || plan.status == "past_due" ) {
            updateCard(function() {
                $("#changePlanConfirmButton").hide();
                $("#cancelLink").hide();
                $("body").css('cursor', 'wait');
                updatePlan(customer, newplan);
            },
            function() {
                $("#changePlanConfirmButton").show();
                $("#cancelLink").show();
                $("body").css('cursor','');
            });
        }
        else {
            updatePlan(customer, newplan);
        }
    });

    $("#loginPanelButton").click(function(e) {
        loginClearErrors();
        $("#loginPanel").slideToggle();
        $("#bs-example-navbar-collapse-1").toggleClass('in');
    });

    $("#loginPanelButtonMobile").click(function(e) {
        loginClearErrors();
        //$("#mobileMenuChecker").attr("checked", false);
        // $("body").css("position", "fixed");
        $("#loginPanel").slideToggle();
    });

    $("#mobileMenuChecker").click(function(e) {
        loginClearErrors();
        $("#loginPanel").slideUp();
    });

    $("#mypagesButton").click(function(e) {
        window.location.href = "/mina-sidor/";
    });

    $("#fbLoginButton").click(function(e) {
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('public_profile');
        provider.addScope('email');
        firebase.auth().signInWithPopup(provider).then(function(r) {
            var token = r.credential.accessToken;
            myPages(r.user.uid);
        });
    });

    $("#goLoginButton").click(function(e) {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        firebase.auth().signInWithPopup(provider).then(function(r) {
            var token = r.credential.accessToken;
            myPages(r.user.uid);
        });
    });

    $("#loginButton").click(function(e) {
        $("#loginButton").hide();
        $(".login-loader").fadeIn(250);
        var uname = $("#loginUsername").val();
        var pwd = $("#loginPassword").val();

        // Clear small error msg
        loginSmalError();

        if( isValidEmailAddress(uname)) {
            loginWithEmail(uname, pwd);
        }
        else if( isCorrectPhone(uname)) {
            $.post(gBackendBase + '/phone/login', {phoneNumber:uname, password:pwd}, function(r) {
                if (r.customToken) {
                    firebase.auth().signInWithCustomToken(r.customToken)
                        .then(function(user) {
                            myPages(user.uid, uname, pwd);
                        })
                        .catch(function(ex) {
                            loginSmalError("Fel användarnamn eller lösenord");
                            $("#loginButton").fadeIn(250);
                            $(".login-loader").hide();
                            console.log(ex);
                        });
                }
            })
            .fail(function(r) {
                loginSmalError("Fel användarnamn eller lösenord");
                $("#loginButton").fadeIn(250);
                $(".login-loader").hide();
            });
        }
        else {
            loginSmalError("Fel användarnamn eller lösenord");
            $("#loginButton").fadeIn(250);
            $(".login-loader").hide();
        }
    });

    $("#forgotPasswordLink").click(function(e) {
        $("#login-section-login").toggle();
        $("#login-section-forgot-password").toggle();
        $("#login-section-error").hide();
    });

    $("#forgotPasswordSendButton").click(function(e) {
        var input = $("#forgotPasswordPhoneMail").val();
        if( isValidEmailAddress(input)) {
            forgotPassword(input);
        }
        else if( isCorrectPhone(input)) {
            $.post(gBackendBase + "/phone/forgot-password", {phoneNumber: input}, function(r) {
                loginSmalError("SMS skickades till ditt telefonnr");
                $("#login-section-login").toggle();
                $("#login-section-forgot-password").toggle();
            })
            .fail(function(r) {
                loginError("HOPPSAN!", "Kunde inte SMS till ditt nr");
            });
        }
    });

    $("#loginLink").click(function(e) {
        $("#login-section-login").toggle();
        $("#login-section-forgot-password").toggle();
        $("#login-section-error").hide();
    });

    $('input[type=radio][name=planRadio]').change(function() {
        if( plan.canceled || plan.status == "past_due" ) {
            $("#changePlanButton").removeClass("btn-disabled");
            return null;
        }
        // this.value
        let c = null;
        switch(this.value) {
            case "month":
                c = (plan.id == "1 month");
                break;
            case "sixmonths":
                c = (plan.id == "6 month");
                break;
            case "year":
                c = (plan.id == "1 year");
                break;
        }
        if( c ) {
            $("#changePlanButton").addClass("btn-disabled");
        }
        else {
            $("#changePlanButton").removeClass("btn-disabled");
        }
    });

    $(".logoutLink").click(function(e) {
        $.get('/api/lgin.php', function(r) {
            throwOut("Logout");
        });
    });



    // Load mina-sidor stuff
    var plan = null;
    if( $("#mina-sidor").length > 0 && $("#cuid").length > 0 ) {
        var uid = null;
        try {
            uid = $("#cuid").val();
        }
        catch(e) {
            console.log(e);
        }
        if( uid != null && uid !== undefined && uid != "" ) {
            firebase.database().ref('/users/'+uid).once('value').then(function(snap) {
                var userdata = snap.val();
                $("#mina-sidor-name").html(stringHandle(userdata.firstname) + " " + stringHandle(userdata.lastname));
                var username = getCookie("username");

                if( username != "" ) {
                    $("#username-info").html("<br><strong>Ditt användarnamn: "+username+"</strong></p>");
                }

                if( isCorrectPhone("07"+uid.substring(3))) {
                    $("#mina-sidor-phone").html(formatPhone("07" + uid.substring(3)));
                }
                else if( isValidEmailAddress(userdata.email)){
                    $("#mina-sidor-phone").html(userdata.email);
                }

                var picUrl = userdata.profilePicture;
                if( picUrl === undefined ) picUrl = userdata.avatarUrl;
                if( picUrl === undefined ) picUrl = "/assets/img/profile-picture.svg"; // Default pic
                if( picUrl == "" ) {
                    $("#mina-sidor-profile-pic").hide();
                }
                else {
                    $("#mina-sidor-profile-pic").prop("src", picUrl);
                }

                firebase.database().ref('/userData/'+uid).once('value').then(function(p) {
                    var ud = p.val();
                    var stripeTok = "";
                    if( ud.purchasesStripe && ud.purchasesStripe.receipt.length !== undefined ) stripeTok = ud.purchasesStripe.receipt;
                    else if( ud.purchases.receipt.length !== undefined && ud.purchases.receipt.substring(0,4) == "cus_") stripeTok = ud.purchases.receipt;

                    if( userdata.premium == true ) {
                        $("#current-stripe-customer").val(stripeTok);
                        $.post(paymentBackend + 'getPlan', {stripeCustomer: stripeTok}, function(r) {
                            plan = strToPlan(r);
                            //if( plan && planStatusOk(plan)) {
                            if( plan ) {
                                var planName = "ALBERT PREMIUM (99 kr/mån)";
                                var price = 99;
                                var ex = new Date(plan.expireTS * 1000);
                                if( plan.cardnr == "0" ) {
                                    // No card registered
                                }
                                
                                if( plan.canceled || plan.status == "past_due" ) {
                                    planName = "PRENUMERATION UPPSAGD";
                                    $("#plan-paragraph").html("Ni har fortsatt tillgång till ert premiumkonto till och med den " + formatDate(ex) + ".");
                                    $("#changePlanInitButton").html("SKAPA NY PRENUMERATION");
                                    $("#changePlanButton").html("SKAPA NY PRENUMERATION");
                                    $("#changePlanButton").removeClass("btn-disabled");
                                    $(".current-plan").hide();
                                    $("#changePlanConfirmButton").html("PÅBÖRJA NY PRENUMERATION");
                                    $("#text-5").html('Din nya prenumeration kommer starta från och med att du bekräftar köpet och du debiteras då <span class="var-plan-current-price">0</span>,00 kr för hela perioden.');
                                    $("#plan-6").html('<h1>Prenumeration aktiverad</h1><p>Vad kul att ni valt att förnya er prenumeration hos Albert! Följande prenumeration är nu aktiv: <span class="plan-new-name"></span>. Din prenumeration förnyas automatiskt den <span class="var-plan-expire"></span> och du debiteras då <span class="var-plan-new-price">0</span>,00 kr.</p>');
                                    //$("#changePlanInitButton").hide();
                                    //$(".card").hide();
                                    if( ! plan.caceled && plan.status == "past_due" ) {
                                        planName = "PRENUMERATION AVSLUTAD";
                                        $("#plan-paragraph").html("Vi har vid upprepade tillfällen försökt debitera ert konto för er prenumeration hos Albert, men ej lyckats. Er prenumeration har därför avslutats. Önskar ni återuppta er prenumeration, vänligen uppdatera era kortuppgifter och gå vidare genom att trycka på “Skapa ny prenumeration” nedan.");
                                    }
                                    else if(( plan.expireTS * 1000) - Date.now() < 0 ) {
                                        planName = "PRENUMERATION AVSLUTAD";
                                        $("#plan-paragraph").html("Ni har har för tillfället ej en aktiv prenumeration hos Albert. Tryck på knappen “Skapa ny prenumeration” nedan för att påbörja en ny prenumeration.");
                                    }
                                }
                                else {
                                    switch(plan.id) {
                                        case "1 month":
                                            planName = "ALBERT PREMIUM (99 kr/mån)";
                                            price = 99;
                                            //$("input[name=planRadio][value='month']").prop("disabled",true);
                                            $("input[name=planRadio][value='month']").prop("checked",true);
                                        break;
                                        case "6 month":
                                            planName = "ALBERT PREMIUM (79 kr/mån - 474 kr totalt)";
                                            price = 474;
                                            //$("input[name=planRadio][value='sixmonths']").prop("disabled",true);
                                            $("input[name=planRadio][value='sixmonths']").prop("checked",true);
                                        break;
                                        case "1 year":
                                            planName = "ALBERT PREMIUM (69 kr/mån - 828 kr totalt)";
                                            price = 828;
                                            //$("input[name=planRadio][value='year']").prop("disabled",true);
                                            $("input[name=planRadio][value='year']").prop("checked",true);
                                        break;
                                        case "Aftonbladet Plus":
                                            planName = "ALBERT PREMIUM (99 kr/mån)";
                                            price = 99;
                                            //$("input[name=planRadio][value='month']").prop("disabled",true);
                                            $("input[name=planRadio][value='month']").prop("checked",true);
                                        break;
                                        case "letsdeal_three_months_edimia" :
                                        case "letsdeal_three_months_albert" :
                                            var lockedFor = parseInt(plan.created) + ( parseInt(60*60*24) * DAYS_TO_NOT_SHOW_CANCEL_BUTTON );
                                            var lockedTime = new Date(lockedFor * 1000).getTime();
                                            var todayTime = new Date().getTime();

                                            if(todayTime < lockedTime){
                                                $('a.cancelForLetsdealBtn').removeAttr('onclick').addClass('disabled-btn');
                                                $('p.letsdealErrorMsg').html('Du har köpt en prenumeration med 3 månaders bindningstid. Prenumerationen kan avslutas först efter tredje och sista debiteringen för din provperiod (49 kr/mnd).');
                                            }

                                            price = 49;
                                            planName = 'ALBERT PREMIUM PROVA-PÅ-LET´S DEAL (49 kr/mån)';
                                            $('#plan-2 div.plans').remove();
                                        break;
                                    }
                                }
                                $("#current-plan-expire").val(ex.valueOf());
                                $("#plan-old-name").html(planName);
                                $(".var-plan-name").html(planName);
                                $(".var-plan-current-price").html(price);
                                $(".var-plan-expire").html(formatDate(ex));
                            }
                            else {
                                // Ingen plan finns
                                planName = "INGEN PRENUMERATION";
                                $("#plan-old-name").html(planName);
                                $(".var-plan-name").html(planName);
                                $("#plan-paragraph").html("Aj då, något gick fel. Kontakta oss på support@hejalbert.se så hjälper vi dig.");
                                $("#changePlanInitButton").hide();
                                $(".current-plan").hide();
                                $("#changePlanConfirmButton").html("PÅBÖRJA NY PRENUMERATION");
                                $("#text-5").html('Din nya prenumeration kommer starta från och med att du bekräftar köpet och du debiteras då <span class="var-plan-current-price">0</span>,00 kr för hela perioden.');
                                $("#plan-6").html('<h1>Prenumeration aktiverad</h1><p>Vad kul att ni valt att förnya er prenumeration hos Albert! Följande prenumeration är nu aktiv: <span class="plan-new-name"></span>. Din prenumeration förnyas automatiskt den <span class="var-plan-expire"></span> och du debiteras då <span class="var-plan-current-price">0</span>,00 kr.</p>');
                            }
                        })
                        .fail(function(r) {
                            alert("Fick ingen kontakt av betalnings-platformen");
                            throwOut(r.responseText);
                        });
                    }
                });
            });
            if( $("#payment-form").length > 0 ) {
                // Needs v3 stripe
                $.getScript("https://js.stripe.com/v3/", function() {
                    setTimeout(function() {
                        // v3
                        //_stripe = Stripe('pk_test_3kPyXnAL0cGCSj0j7JTTrhVF');
                        _stripe = Stripe('pk_live_gNNHdye71kfdXCfefhlSkKHO');
                        stripeElementsSetup();
                    },300);
                });
            }
        }
        else {
            // no UID
            throwOut("No UID!");
        }
    }

    

    
    $(".login-loader").hide();

    // Store "landing page url"
    if( ! window.localStorage.getItem('n_landing')) {
        window.localStorage.setItem('n_landing', window.location.href);
    }

    // Do some stuff on congrats
    if( $("#congrats-section").length > 0 ) {
        var uid = window.localStorage.getItem('n_uid');
        var landingUrl = window.localStorage.getItem('n_landing');
        window.localStorage.removeItem('n_uid');
        window.localStorage.removeItem('n_landing');
    }

    console.log("auth.js version 0.59");
});

function loginClearErrors() {
    $("#login-error-small").hide();
    $("#login-section-login").show();
    $("#login-section-error").hide();
    $("#loginPanel").removeClass("login-panel-error");
}
function formatPhone(nr) {
    return nr.substring(0,3) + "-" + nr.substring(3,6) + " " + nr.substring(6,8) + " " + nr.substring(8);
}


function formatDate(dateObj) {
    return dateObj.getFullYear() + "-" + ('00'+(dateObj.getMonth() + 1)).slice(-2) + "-" + ('00'+dateObj.getDate()).slice(-2);
}

function throwOut(reason) {
    console.log(reason);
    window.location.href = "/";
}

function stringHandle(str) {
    if( str === undefined ) str = "";
    return str;
}

function planStatusOk(plan_b) {
    if( plan_b.status == "trialing" ||
        plan_b.status == "active" ||
        plan_b.status == "unpaid" ) return true;
    return false;
}

function stripeElementsSetup() {
        if( _stripe != null ) {
            // Create an instance of Elements
            var elements = _stripe.elements();

            // Custom styling can be passed to options when creating an Element.
            // (Note that this demo uses a wider set of styles than the guide below.)
            var style = {
              base: {
                color: '#32325d',
                lineHeight: '24px',
                //fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontFamily: 'Bariol, Helvetica',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
            };

            // Create an instance of the card Element
            _card = elements.create('card', {style: style, hidePostalCode : true});

            // Add an instance of the card Element into the `card-element` <div>
            _card.mount('#card-element');

            // Handle real-time validation errors from the _card Element.
            _card.addEventListener('change', function(event) {
              if (event.error) {
                $("#card-errors").html(event.error.message);
              } else {
                $("#card-errors").html('');
              }
            });
        }
    }
function stripeFormSetup()
{
    if( _stripeObj != null ) {
        var elements = _stripeObj.elements();

        var style = {
            base: {
                color: '#32325d',
                lineHeight: '24px',
                fontFamily: 'Bariol, Helvetica',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };

        // Create an instance of the card Element
        _cardObj = elements.create('card', {style: style, hidePostalCode : true});
        // Add an instance of the card Element into the `card-element` <div>
        _cardObj.mount('#card_structure');
        // Handle real-time validation errors from the _card Element.
        _cardObj.addEventListener('change', function(event) {
            if (event.error) {
                jQuery("#paymentError").html(event.error.message);
            } else {
                jQuery("#paymentError").html('');
            }
        });
    }
}

function getUserInfLocalstorage()
{
    var userLocalStorage = {};
    for (var key in localStorage){
        userLocalStorage[key] = localStorage.getItem(key);
    }
    //console.log(userLocalStorage)
    var objToUrl = JSON.stringify(userLocalStorage);
    //console.log(objToUrl.length)
    if(objToUrl.length > 500){
        return btoa(objToUrl);
    } else {
        return false
    }
}

function getCookie(cname)
{
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
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

function loadScreenOn() {
    $("#screenDimmer").fadeIn(250);
    $(".loading-screen").fadeIn(100);
}

function loadScreenOff() {
    $("#screenDimmer").fadeOut(100);
    $(".loading-screen").fadeOut(100);
}

function isCorrectEmail(email) {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
}

function isCorrectPhone(phonenr)
{
    var nr = phonenr.replace(/\s/g, '');
    nr = nr.replace(/-/g, '');
    var regex = /^[0-9]{10}$/;
    return regex.test(nr);
}

function saveParentEmail()
{
    $('.registrationError').html('');
    var email = $('input#parentEmail').val().trim();
    if(email == '')
    {
        $('.registrationError').html('Ange din epostadress.');
        return false;
    }
    
    if(!isValidEmailAddress(email))
    {
        $('.registrationError').html('Den angivna epostadressen verkar vara felaktig.');
        return false;
    }
    var phone = getCookie('phoneNr');
    phone = '46'+phone.substr(1);
    loadScreenOn();

    $.post(SITE_URL+"/api/process.php", {method : 'addParentEmail', data : { userID : phone, parentEmail : email }}, function(retData) {
        var res = JSON.parse(retData);
        console.log(res);
        loadScreenOff();
        if(res.status == 'Parent email added')
        {
            $('p.emailSuccessMessage').removeClass('hide');
        }
    });
} 

function isValidEmailAddress(emailAddress)
{
    var pattern = /^([a-z\d!#$%&amp;'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&amp;'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
}

function registerRedeemFormDone(currentForm)
{
    sessionStorage.clear('icaModule');
    sessionStorage.clear('icaModuleType');

    var usernameFlag = false;
    var phoneNunberFlag = emailFlag = false;

    var acceptedTerms = $(currentForm).find('input:checkbox').is(':checked');
    var errors = 0;
    $('.registrationError').html('');

    if($(currentForm).find('input:radio.classType:checked').length == 0)
    {
        $('.registrationError').append('För att skapa ditt konto välj årskurs i listan');
        return false;
    }

    if( $(currentForm).find('#pincode').length == 0) {
        $('.registrationError').append('Fyll i din PIN-kod<br/>');
        return false;
    }
    
    if( $(currentForm).find('#pincode').length != 0 && $(currentForm).find('#pincode').val().length < 1 ) {
        $('.registrationError').append('Fyll i rätt PIN-kod<br/>');
        return false;
    }
    
    var phoneEmail = $(currentForm).find('#phoneRedeem').val().trim();
    if( isValidEmailAddress(phoneEmail)) {
        usernameFlag = true;
        emailFlag = true;
    }
    else if( isCorrectPhone(phoneEmail)) {
        usernameFlag = true;
        phoneNunberFlag = true;
    }

    if(!usernameFlag)
    {
        $('.registrationError').append('Du måste godkänna Alberts medlemsvillkor<br/>');
        return false;
    }

    if( ! acceptedTerms ){
        $('.registrationError').append('Du måste godkänna Alberts medlemsvillkor<br/>');
        return false;
    }
    
    var method = 'emailPremiumCheck';
    if(phoneNunberFlag)
    {
        method = 'premiumCheck';
        phoneEmail = loginToPhoneNr(phoneEmail);
    }
    
    var pincodeNr = $(currentForm).find('#pincode').val().trim();

    loadScreenOn();

    if(pincodeNr.toLowerCase() == 'matte')
    {
        pincodeNr = pincodeNr.toLowerCase();
        $.post(SITE_URL+"/api/process.php", {method : method, data : { username : phoneEmail }}, function(retData) {
            var res = JSON.parse(retData);

            if(res.status == "200" || res.status == "300")
            {
                var context = 'Retail';

                ga('send', 'Checkout' + context);
                fbq('track', 'Checkout' + context);

                fbq('track', 'AddToCart', {
                    content_name: context
                });

                ga('send', 'event', {
                    eventCategory: 'Cart',
                    eventAction: 'AddToCart',
                    eventLabel: context
                });
                
                if(phoneNunberFlag)
                {
                    document.cookie = "phoneNr=" + phoneEmail + "; path=/";
                    document.cookie = "icaCheckPremium=phone;path=/";
                }
                else
                {
                    document.cookie = "emailAddr=" + phoneEmail + "; path=/";
                    document.cookie = "icaCheckPremium=email;path=/";
                }
                    
                document.cookie = "landingpage=ica; path=/";
                document.cookie = "pincodeNr=" + pincodeNr + "; path=/";
                document.cookie = "stripePlan=" + $(currentForm).find('input:radio.classType:checked').val() + "; path=/";

                sessionStorage.setItem('icaModule', true);
                sessionStorage.setItem('icaModuleType', $(currentForm).find('input:radio.classType:checked').val());
                
                if(res.status == "300")
                {
                    var customerId = res.customer;
                    $.post(paymentBackend + "addDiscount", {stripeCustomer: customerId, pincode : pincodeNr}, function(retData) {
                        if(retData == "OK")
                        {
                            var icaMode = getCookie('icaCheckPremium');
                            var postData = {method : "updateKit", data : { pincode : pincodeNr, phone : phoneEmail }};
                            if(icaMode == 'email')
                            {
                                postData = {method : "updateKit", data : { pincode : pincodeNr, email : phoneEmail }};
                            }

                            $.post(SITE_URL+"/api/process.php", postData, function(retData) {
                                var res = JSON.parse(retData);
                                if(res.status == "Gift code redeemed.")
                                {
                                    sessionStorage.setItem('icaModule', true);
                                    sessionStorage.setItem('icaModuleType', $(currentForm).find('input:radio.classType:checked').val());
                                    if(icaMode == 'email')
                                    {
                                        window.location.href = SITE_URL+'/congratse';
                                    }
                                    else
                                    {
                                        window.location.href = SITE_URL+'/congrats';
                                    }
                                }
                                else {
                                    loadScreenOff();
                                    alert("Något gick fel, kontakta suporten");
                                }
                            });
                        }
                        else {
                            loadScreenOff();
                            alert("Något gick fel, kontakta suporten");
                        }
                    });
                }
                else
                {
                    window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/')) + "/checkout/";
                }
            }
            else {
                loadScreenOff();
                alert("Något gick fel, kontakta suporten");
            }
        });
    }
    else
    {
        var dataFields = {method : 'validateRetailKit', data : { pincode : pincodeNr, email : phoneEmail }};
        if(phoneNunberFlag)
        {
            var dataFields = {method : 'validateRetailKit', data : { pincode : pincodeNr, phone : phoneEmail }};
        }

        $.post(SITE_URL+"/api/process.php", dataFields, function(retData) {
            var res = JSON.parse(retData);
            
            if(res.status == "500")
            {
                loadScreenOff();
                alert("Ett oväntat fel har uppstått, kontakta support");
            }
            else if(res.status == "400")
            {
                loadScreenOff();
                alert("Koden har gått ut eller används redan");
            }
            else if(res.status == "200" || res.status == "300")
            {
                var context = 'Retail';

                ga('send', 'Checkout' + context);
                fbq('track', 'Checkout' + context);

                fbq('track', 'AddToCart', {
                    content_name: context
                });

                ga('send', 'event', {
                    eventCategory: 'Cart',
                    eventAction: 'AddToCart',
                    eventLabel: context
                });
                
                if(phoneNunberFlag)
                {
                    document.cookie = "phoneNr=" + phoneEmail + "; path=/";
                    document.cookie = "icaCheckPremium=phone;path=/";
                }
                else
                {
                    document.cookie = "emailAddr=" + phoneEmail + "; path=/";
                    document.cookie = "icaCheckPremium=email;path=/";
                }
                    
                document.cookie = "landingpage=ica; path=/";
                document.cookie = "pincodeNr=" + pincodeNr + "; path=/";
                document.cookie = "stripePlan=" + $(currentForm).find('input:radio.classType:checked').val() + "; path=/";

                sessionStorage.setItem('icaModule', true);
                sessionStorage.setItem('icaModuleType', $(currentForm).find('input:radio.classType:checked').val());
               
               
                if(res.status == "300")
                {
                    var customerId = res.customer;
                    $.post(paymentBackend + "addDiscount", {stripeCustomer: customerId, pincode : pincodeNr}, function(retData) {
                        if(retData == "OK")
                        {
                            var icaMode = getCookie('icaCheckPremium');
                            var postData = {method : "updateKit", data : { pincode : pincodeNr, phone : phoneEmail }};
                            if(icaMode == 'email')
                            {
                                postData = {method : "updateKit", data : { pincode : pincodeNr, email : phoneEmail }};
                            }

                            $.post(SITE_URL+"/api/process.php", postData, function(retData) {
                                var res = JSON.parse(retData);
                                if(res.status == "Gift code redeemed.")
                                {
                                    sessionStorage.setItem('icaModule', true);
                                    sessionStorage.setItem('icaModuleType', $(currentForm).find('input:radio.classType:checked').val());
                                    if(icaMode == 'email')
                                    {
                                        window.location.href = SITE_URL+'/congratse';
                                    }
                                    else
                                    {
                                        window.location.href = SITE_URL+'/congrats';
                                    }
                                }
                                else {
                                    loadScreenOff();
                                    alert("Något gick fel, kontakta suporten");
                                }
                            });
                        }
                        else {
                            loadScreenOff();
                            alert("Något gick fel, kontakta suporten");
                        }
                    });
                }
                else
                {
                    window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/')) + "/checkout/";
                }
            }
            else {
                loadScreenOff();
                alert("Något gick fel, kontakta suporten");
            }
        });
    }
}


function registerLetsDeal(currentForm) {

    var acceptedTerms = $(currentForm).find('input:checkbox#checkbox-3').is(':checked');
    var errors = 0;
    $('.registrationError').html('');

    if( $(currentForm).find('#phoneSignUp').val().replace(/[^\d]/g,'').length < 10 ||
        $(currentForm).find('#phoneSignUp').val().substring(0,2) != "07" ) {
        $('.registrationError').append('Angivet mobilnummer är skrivet i felformat. Rätt format är 07xxxxxxxx<br/>');
        return false;
    }

    if( $(currentForm).find('#email').val().trim() == '' )
    {
        $('.registrationError').append('Fyll i en korrekt e-postaddress');
        return false;
    }

    if( !isValidEmailAddress($(currentForm).find('#email').val() )){
        $('.registrationError').append('Fyll i din e-post<br/>');
        return false;
    }

    var classType = $(currentForm).find('input:radio.classType').is(':checked');
    if( ! classType ){
        $('.registrationError').append('Vänligen välj den årskursgrupp som passar ditt barn.');
        return false;
    }

    if( ! acceptedTerms ){
        $('.registrationError').append('Du måste godkänna Alberts medlemsvillkor<br/>');
        return false;
    }

    var phoneNr = loginToPhoneNr($(currentForm).find('#phoneSignUp').val());

    $.post(gBackendBase + '/phone/checkPremium', {"phoneNumber":phoneNr}, function(response) {
        if( response === true ) {
            $('.registrationError').append('Det angivna telefonnumret är redan en Premiumanvändare, inget köp behövs utföras<br/>');
            errors++;
        }
    }).always(function() {
        if( ! errors ) {
            var context = 'Elev';
            if( window.location.href.indexOf('parent') > -1) context = 'Foralder';
            if( window.location.href.indexOf('aftonbladet') > -1) context = 'Aftonbladet';
            if( window.location.href.indexOf('now') > -1) context = 'Mixed';

            ga('send', 'Checkout' + context);
            fbq('track', 'Checkout' + context);

            fbq('track', 'AddToCart', {
                content_name: context
            });

            ga('send', 'event', {
                eventCategory: 'Cart',
                eventAction: 'AddToCart',
                eventLabel: context
            });
            
            $(".payment-sms-info").show();
            $("#phoneSpan").html(phoneNr);

            loadScreenOff();
            document.cookie = "phoneNr=" + phoneNr + "; path=/";
            document.cookie = "emailReg=" + $(currentForm).find('#email').val().trim() + "; path=/";
            document.cookie = "stripePlan=" + $(currentForm).find('input:radio.classType:checked').val() + "; path=/";
            
            window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/')) + "/checkout/";
            
        }
    });
}
function registerUserPassword(currentForm)
{
    userInfAuthEmail = $(currentForm).find('#emailSignUp').val().trim();
    loadScreenOn();
    firebase.auth().createUserWithEmailAndPassword(
        userInfAuthEmail,
        userInfAuthPass
    ).then(function(user){
        $('.registrationError').html('');
        gUser = user;
        userEmailReg = user.email;
        userInf.uid = user.uid;
        var eventData = {
            type: "register_event",
            userId: userInf.uid,
            data:  {
                eventType: 'register',
                eventValue: 0,
            }
        };
        if(sessionStorage.getItem('schoolCode')){
            applySchoolCodeUser(userInf.uid)
        }
        firebase.database().ref('/assessmentQueue/tasks').push(eventData);

        firebase.database().ref('/users/'+userInf.uid).once('value', function(data){
            userInf.user_profile = data.val();
        });
        firebase.database().ref('/users/'+userInf.uid).update({
            registrationOrigin: 'webSite',
            mobilePhone: phoneNr
        });
        if( $('#emailSignUp').val().length > 0 ) {
             firebase.database().ref('/users/'+userInf.uid).update({
                email: $('#emailSignUp').val().trim()
            });
        }
        getUserInfLocalstorage();
        
        
    }).catch(function(err){
        // alertMessager.error($filter("translate")(err.message));
        // registerBusy = false;
        //console.error(err);
        errorsRegistration(err, userInfAuthEmail, userInfAuthPass)
    });
}

function errorsRegistration(err, loginEmail, loginPass)
{
    if(err.code == 'auth/weak-password'){
        var errMessage = 'Lösenordet måste innehålla minst 6 tecken';
    } else if (err.code == 'auth/email-already-in-use'){
        var errMessage = 'Det finns redan ett konto registrerat för den här användaren.';
        loginWithPass(loginEmail,loginPass);
    } else if(err.code == 'auth/invalid-email'){
        var errMessage = 'Fälten nedan ej korrekt ifyllda.';
    } else {
        var errMessage = err.message;
    }
    $('.registrationError').html(errMessage);
}

function registerFormDone(currentForm)
{
    var acceptedTerms = $(currentForm).find('input:checkbox#checkbox-3').is(':checked');
    var errors = 0;
    $('.registrationError').html('');

    if( $(currentForm).find('#phoneSignUp').val().replace(/[^\d]/g,'').length < 10 ||
        $(currentForm).find('#phoneSignUp').val().substring(0,2) != "07" ) {
        $('.registrationError').append('Angivet mobilnummer är skrivet i felformat. Rätt format är 07xxxxxxxx<br/>');
        errors++;
        return false;
    }
    if( $(currentForm).find('#emailSignUp').length != 0 && $(currentForm).find('#emailSignUp').val().length < 5 ) {
        $('.registrationError').append('Fyll i din e-post<br/>');
        errors++;
        return false;
    }
    if( ! acceptedTerms ){
        $('.registrationError').append('Du måste godkänna Alberts medlemsvillkor<br/>');
        errors++;
        return false;
    }

    var phoneNr = loginToPhoneNr($(currentForm).find('#phoneSignUp').val());

    $.post(gBackendBase + '/phone/checkPremium', {"phoneNumber":phoneNr}, function(response) {
        if( response === true ) {
            $('.registrationError').append('Det angivna telefonnumret är redan en Premiumanvändare, inget köp behövs utföras<br/>');
            errors++;
        }
    }).always(function() {
        if( ! errors ) {
            var context = 'Elev';
            if( window.location.href.indexOf('parent') > -1) context = 'Foralder';
            if( window.location.href.indexOf('aftonbladet') > -1) context = 'Aftonbladet';
            if( window.location.href.indexOf('now') > -1) context = 'Mixed';

            ga('send', 'Checkout' + context);
            fbq('track', 'Checkout' + context);

            fbq('track', 'AddToCart', {
                content_name: context
            });

            ga('send', 'event', {
                eventCategory: 'Cart',
                eventAction: 'AddToCart',
                eventLabel: context
            });
            
            $(".payment-sms-info").show();
            $("#phoneSpan").html(phoneNr);

            loadScreenOff();
            document.cookie = "phoneNr=" + phoneNr + "; path=/";
            document.cookie = "stripePlan=" + $(currentForm).find('input:radio.classType:checked').val() + "; path=/";
                        
            window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/')) + "/checkout/";
        }
    });
}

    function generatePaymentButtons(user)
    {
        console.log(user, 'user')
        console.log('modal opened successfuly');
        var userInfLocalstorage = getUserInfLocalstorage();
        var landingUrl = window.localStorage.getItem('n_landing');
        $('form#9900, form#5500').remove();
        $.get(paymentBackend+'checkout/'+user.uid, function(response) {
            console.log(response)
            $.each(response.data, function() {
                var ID = this.id.replace(/\s/g, '');
                var stripeForm = '<form action="'+paymentBackend+'payment/'+ user.uid+'" id="' + this.amount + '" method="post">' +
                    '<input type="hidden" name="plan" value="' + this.id + '">' +
                    '<input type="hidden" name="interval" value="' + this.id + '">' +
                    '<input type="hidden" name="origin" value="' + landingUrl + '">' +
                    '<input type="hidden" name="urlRedirect" value="'+currentSiteUsrl+'#'+'purchaseCongrats'+registrationFlowOrigin+'">' +
                    '<script src="https://checkout.stripe.com/checkout.js"' +
                    'class="stripe-button"' +
                    'data-key="' + response.public_key + '"' +
                    'data-currency="sek"' +
                    'data-description="Du debiteras efter 7 dagar"' +
                    'data-amount="' + this.amount + '"' +
                    'data-locale="auto"' +
                    'data-email="'+userEmailReg+'"' +
                    'data-label="PÅBÖRJA MED 7 DAGAR GRATIS">' +
                    '</script>' +
                    '</form>';
                console.log(stripeForm)
                $('#mobileModalPayment #' + ID).append(stripeForm);
                $('#modalDescPayment #' + ID).append(stripeForm);
            });
        });
    }

    function signInWithPopup(provider, register){
        $("#register-section").addClass("dim");
        loadScreenOn();

        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            gUser = user;
            if(sessionStorage.getItem('schoolCode')){
                applySchoolCodeUser(user.uid);
            }
            if(!register){
                var userlocalData = getUserInfLocalstorage();
                if(userlocalData){
                    window.open(applicationUrl+'?'+userlocalData, '_blank');
                }
            }else {
                firebase.database().ref('/users/'+user.uid).update({
                    registrationOrigin: 'webSite'
                });
                if( $('#phoneSignUp').val().length > 0 ) {
                     firebase.database().ref('/users/'+user.uid).update({
                        mobilePhone: $('#phoneSignUp').val().trim()
                    });
                }
                if( $('#emailSignUp').val().length > 0 ) {
                     firebase.database().ref('/users/'+user.uid).update({
                        email: $('#emailSignUp').val().trim()
                    });
                }
                getUserInfLocalstorage();
                //generatePaymentButtons(user);
                $("#register-section").fadeOut(300, function() {
                    loadScreenOff();
                    $("#payment-section").fadeIn(500);
                });
                //$('.modal-subscription').fadeIn(1000).siblings().css('display', 'none');
            }

            // config.databaseURL.ref('/users/'+user.uid).once('value', function(data){
            //     var profile_data = data.val();
            // });
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            console.error(errorCode, errorMessage);
        });
    };

    function applySchoolCodeUser(userUid){
        var userCode = JSON.parse(sessionStorage.getItem('schoolCode'));
        //console.log(userCode)
        var refCodeUsedCount = firebase.database().ref('content/schools/'+userCode.school+'/codes/'+userCode.code+'/usedCount')
        refCodeUsedCount.transaction(function(currentData) {
            return currentData + 1;
        }).then(function () {
            if(userCode.codeInf.premium){
                var userCodeAdd = {
                    school: userCode.school,
                    varifCode: userCode.code,
                    premium: true
                };
                firebase.database().ref('/userData/'+userUid).update({
                    purchases: {receipt: userCode.code}
                })
            }else {
                var userCodeAdd = {
                    school: userCode.school,
                    varifCode: userCode.code,
                }
            }
            firebase.database().ref('/users/'+userUid).update(userCodeAdd,function (err) {
                if(err){
                    console.log(err)
                }else{
                }
            });
        }).then(function () {
            sessionStorage.removeItem('schoolCode');
        })
    }

    function loginToPhoneNr(login) {
        return login.trim().replace(/\+/g,'0').replace(/[^\d]/g,'')
    }

    function loginWithPass(loginPhoneNr,loginPass){
        firebase.auth().signInWithEmailAndPassword(
            loginPhoneNr,loginPass
        ).then(function(user){
            firebase.database().ref('/users/'+user.uid).once('value', function(data){
                userInf = data.val();
            });
            if( $('#phoneSignUp').val().length > 0 ) {
                 firebase.database().ref('/users/'+user.uid).update({
                    mobilePhone: $('#phoneSignUp').val().trim()
                });
            }
            if( $('#emailSignUp').val().length > 0 ) {
                 firebase.database().ref('/users/'+user.uid).update({
                    email: $('#emailSignUp').val().trim()
                });
            }
            // Show payment form
            $("#register-section").fadeOut(300, function() {
                loadScreenOff();
                $("#payment-section").fadeIn(500);
            });
        }).catch(function(error){
            console.log(error)
            errorslogIn(error)
        });
    };

    function errorslogIn(err){
        console.log(err)
        if(err.code == 'auth/wrong-password'){
            var errMessage = 'Fel e-post eller lösenord';
        } else {
            var errMessage = err.message;
        }
        $('.registrationError').html(errMessage);
    }

        function checkIfPurchaseDone()
    {
        if(window.location.href.indexOf('congrats') !== -1){
            fbq('track', 'Purchase', {
                value: 1400,
                currency: 'SEK',
                content_name: 'Foralder'
            });

            ga('send', 'event', {
              eventCategory: 'Purchase',
              eventAction: 'done',
              eventLabel: 'Foralder'
            });
        }
    }

    function checkForRedirectUrl() {
        var urlHash = window.location.hash;
        if(urlHash.indexOf('skapaKontoElev') !== -1 || window.location.search.indexOf('skapaKontoElev') !== -1){
            registrationFromParent = true;
            registrationFlowOrigin = 'Parents';
            $('.subscribeMarket').hide();
            console.log('openModal')
            if(isMobile){
                $('#modal-registratio').modal('hide');
                mobileShowRegParents();
            } else {
                $('#modal-start-trial').modal('show')
                $('.modal-start-trial-parent').fadeIn(1000).siblings().css('display', 'none');
            }
            window.location.hash = '';
            //window.location.search = '';
        } else if (urlHash.indexOf('skapaKontoForalder') !== -1 || window.location.search.indexOf('skapaKontoForalder') !== -1){
            registrationFromParent = true;
            registrationFlowOrigin = 'Students';
            $('.subscribeMarket').show();
            if(isMobile){
                $('#modal-registratio').modal('hide');
                mobileShowRegStud();
            } else {
                $('#modal-start-trial').modal('show')
                $('.modal-start-trial').fadeIn(1000).siblings().css('display', 'none');
            }
            window.location.hash = '';
            //window.location.search = '';
        }
    }

    function authFacebook(register){
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');
        signInWithPopup(provider, register);
    };

     function authGoogle(register){
         var provider = new firebase.auth.GoogleAuthProvider();
         provider.addScope('https://www.googleapis.com/auth/userinfo.email');
         signInWithPopup(provider, register);
    };

    function validateSchoolCode(code){
        if(code){
            loadScreenOn();
            firebase.database().ref('content/indexes/codesToSchool/'+code)
                .once('value')
                .then(function (res) {
                    var school = res.val();
                    if(school){
                        var codeRef = firebase.database().ref('content/schools/'+school+'/codes/'+code);
                        codeRef.once('value')
                            .then(function (res) {
                                var schoolCode = res.val();
                                if(!schoolCode) {
                                    $('.schoolCodeAlert').html('Ogiltig kod');
                                }
                                if(schoolCode.usedCount > schoolCode.allowedCount){
                                    $('.schoolCodeAlert').html('Koden har redan använts av en annan användare');
                                }else if(new Date() > new Date(schoolCode.expireDate)){
                                    $('.schoolCodeAlert').html('Koden är inte längre aktiv');
                                }else if(!schoolCode.active){
                                    $('.schoolCodeAlert').html('Koden är inte längre aktiv');
                                }else{
                                    $('.schoolCodeAlert').html();
                                    applySchoolCode(schoolCode, school, code);
                                    // Go to payment form.
                                    $("#register-school-login").fadeOut(100);
                                    $("#register-section").fadeOut(300, function() {
                                        $("#payment-section").fadeIn(500);
                                    });
                                }
                                loadScreenOff();
                            })
                    }else{
                        $('.schoolCodeAlert').html('Ogiltig kod');
                        loadScreenOff();
                    }
                });
        }
    }

    function applySchoolCode(schoolCode, school, code){
        var userCode = {
            'school':school,
            'codeInf':schoolCode,
            'code':code
        },
        codeToSave = JSON.stringify(userCode);
        sessionStorage.setItem('schoolCode', codeToSave);
    }

    function mobileShowRegStud() {
        $('header, main, footer').hide();
        $('#mobileModalRegStudent').show();
    }
    function mobileModalHide() {
        $('header, main, footer').show();
        $('.modalForMobile').hide();
    }

    function mobileShowRegParents() {
        $('header, main, footer').hide();
        $('#mobileModalRegParents').show();
    }

    function mobileHideRegParents() {
        $('header, main, footer').hide();
        $('#mobileModalRegParents').show();
    }

    function mobileModalPayShow() {
        mobileModalHide();
        $('header, main, footer').hide();
        $('#mobileModalPayment').show();
    }
    function mobileModalSchoolShow() {
        mobileModalHide();
        $('header, main, footer').hide();
        $('#mobileModalSchoolLogin').show()
    }

    function modileModalCongratsSt() {
        mobileModalHide();
        $('header, main, footer').hide();
        $('#mobileModalCongratsSt').show()
    }

    function modileModalCongratsPr() {
        mobileModalHide();
        $('header, main, footer').hide();
        $('#mobileModalCongratsPr').show()
    }

    function stripePayResponseHandler(response) {
        var form = $('#payment');

        if( response.error ) {
            var svMsg = "Vi har problem med att verifiera ditt kort.";
            if( response.error.code == "invalid_number" ) svMsg = "Det verkar som att kortuppgifterna inte stämmer. Vänligen dubbelkolla uppgifterna och prova igen.";
            if( response.error.code == "invalid_expiry_month" ) svMsg = "Det verkar som att utgångsdatumet på kortet inte stämmer. Vänligen dubbelkolla uppgifterna och prova igen.";
            if( response.error.code == "invalid_expiry_year" ) svMsg = "Det verkar som att utgångsdatumet på kortet inte stämmer. Vänligen dubbelkolla uppgifterna och prova igen.";
            if( response.error.code == "invalid_cvc" ) svMsg = "Den angivna säkerhetskoden (CVC) verkar inte stämma. Vänligen dubbelkolla uppgifterna och prova igen.";
            if( response.error.code == "incorrect_number" ) svMsg = "De angivna kortuppgifterna verkar inte stämma. Vänligen dubbelkolla uppgifterna och prova igen.";
            if( response.error.code == "expired_card" ) svMsg = "Det verkar som att ditt kort inte längre är giltigt.";
            if( response.error.code == "card_declined" ) svMsg = "Transaktionen medgavs ej av banken.";
            if( response.error.code == "processing_error" ) svMsg = "Tekniskt fel. Vänligen prova igen om en stund eller kontakta oss på support@hejalbert.se";
            if( response.error.code == "incomplete_cvc" ) svMsg = "Ditt korts säkerhetskod verkar inte vara fullständigt.";
            if( response.error.code == "incomplete_zip" ) svMsg = "Det angivna postnumret verkar inte vara fullständigt. ";
            if( response.error.code == "incomplete_number" ) svMsg = "Det angivna kortnumret verkar inte stämma. Vänligen dubbelkolla uppgifterna och prova igen.";
            $("#paymentError").html(svMsg);
            $('#startPeriod').fadeIn(100);
            loadScreenOff();
        }
        else {
            var token = response.token.id;
            var landingUrl = window.localStorage.getItem('n_landing');
            form.append($('<input type="hidden" name="stripeToken">').val(token));
            form.append($('<input type="hidden" name="origin">').val(landingUrl));

            if( $("#emailSignUp").count > 0 )
            {
                form.append($('<input type="hidden" name="email">').val($('#emailSignUp').val().trim()));
            }
            
            var icaMode = getCookie('icaCheckPremium');
            if(icaMode == 'email')
            {
                var email = getCookie('emailAddr');
                if(!isValidEmailAddress(email)){
                    window.location.href = "/register-now";
                    return -1;
                }
                form.append($('<input type="hidden" name="email">').val(email));
            }
            else
            {
                var phoneNr = getCookie('phoneNr');
                var uid = document.getElementById("guid");
                if( uid ) {
                    uid = uid.value;
                    if( uid.length < 8 ) return -1;
                    phoneNr = uid; // Store uid as phonenr
                }
                if( !phoneNr || phoneNr.length < 5 ) {
                    window.location.href = "/register-now";
                    return -1;
                }
                form.append($('<input type="hidden" name="mobilePhone">').val(phoneNr));
                
                if( uid ) {
                    form.append($('<input type="hidden" name="uid">').val(uid));
                }
                else {
                    // used for firebase update on congrats page
                    uid = "46" + phoneNr.substring(1);
                    window.localStorage.setItem('n_uid', uid);
                }
            }
            

            var context = 'Elev';
            if( window.location.href.indexOf('parent') > -1) context = 'Foralder';
            if( window.location.href.indexOf('now') > -1) context = 'Mixed';


            ga('send', 'event', {
              eventCategory: 'Purchase',
              eventAction: 'done',
              eventLabel: context
            });


            form.get(0).submit();
        }
    }

    function runStripePayment() {
        var form = $('#payment');

        // If /checkout/ page with UID
        var uid = document.getElementById("guid");
        if( uid ) {
            uid = uid.value;
            // Verify uid is sensible
            if( uid.length < 8 ) return -1;
        }
        else {
            var icaMode = getCookie('icaCheckPremium');

            var validationMode = 'phone';
            var dataFields = {};
            var endpoint = '';
            if(icaMode == 'email')
            {
                validationMode = 'email';
            }

            if(validationMode == 'email')
            {
                var email = getCookie('emailAddr');
                if(!isValidEmailAddress(email)){
                    window.location.href = "/register-now";
                    return -1;
                }

                dataFields = {"email":email};
                endpoint = gBackendBase + '/email/checkPremium';
            }
            else
            {
                // Verify there is a phonenr
                var phoneNr = getCookie('phoneNr');
                if( !phoneNr || phoneNr.length < 8 ) {
                    // Phonenr not got from previous page
                    window.location.href = "/register-now"; // Send user back one step
                    return -1;
                }

                dataFields = {"phoneNumber":phoneNr};
                endpoint = gBackendBase + '/phone/checkPremium';
            }

            var parentSelectClass = getCookie('stripePlan');
            if( !parentSelectClass ) {
                // Phonenr not got from previous page
                window.location.href = "/register-now"; // Send user back one step
                return -1;
            }
        }

        // Hide submit button
        $('#startPeriod').fadeOut(100);
        loadScreenOn();

        // Check so user does not already exist
        var errors = 0;
        $.post(endpoint, dataFields, function(response) {
            if( response === true ) {
                $('.registrationError').append('Det angivna telefonnumret är redan en Premiumanvändare, inget köp behövs utföras<br/>');
                errors++;
            }
        }).always(function() {
            if( errors < 1 ) {
                // Request a token from stripe
                _stripeObj.createToken(_cardObj).then(stripePayResponseHandler );
            }
        });
    }

    function setPhone(t)
    {
        var cVal = t.val().replace(/[^0-9]/g,'');
        if( cVal.length > 8 ) t.val(cVal.substring(0,3) + " " + cVal.substring(3,6) + " " + cVal.substring(6,8) + " " + cVal.substring(8,10));
        else if( cVal.length > 6 ) t.val(cVal.substring(0,3) + " " + cVal.substring(3,6) + " " + cVal.substring(6));
        else if( cVal.length > 3 ) t.val(cVal.substring(0,3) + " " + cVal.substring(3));
        else t.val(cVal);
    }
    function verifyTeacherForm() {
        var email = $("#fieldEmail").val();
        var phone = $("#fieldPhone").val().replace(/[^0-9]/g,'');

        if( phone.length > 2 && email.length > 3 && email.indexOf('@') > -1 ) {
            $("#schoolInfoSubmit").prop('disabled', false);
            $("#schoolInfoSubmit").css('background-color','#00b08d');
            $("#schoolInfoSubmit").css('color','#fff');
        }
        else {
            $("#schoolInfoSubmit").prop('disabled', true);
            $("#schoolInfoSubmit").css('background-color','#e3e1e3');
            $("#schoolInfoSubmit").css('color','#b8b6b9');
        }
    }
    function phonenrFix(e) {
        e.preventDefault();
        if( (e.keyCode > 36 && e.keyCode < 41) || e.keyCode == 8 ) {
            return true;
        }
        var pushCarPos = e.target.selectionStart;
        var cVal = $(e.target).val().replace(/[^0-9]/g,'');
        if( cVal.length > 8 ) $(e.target).val(cVal.substring(0,3) + " " + cVal.substring(3,6) + " " + cVal.substring(6,8) + " " + cVal.substring(8,10));
        else if( cVal.length > 6 ) $(e.target).val(cVal.substring(0,3) + " " + cVal.substring(3,6) + " " + cVal.substring(6));
        else if( cVal.length > 3 ) $(e.target).val(cVal.substring(0,3) + " " + cVal.substring(3));
        else $(e.target).val(cVal);
        e.target.selectionStart = pushCarPos+1;
        e.target.selectionEnd = pushCarPos+1;
    }
    function loginError(title, body, subtext) {
        if( title !== undefined ) $("#login-error-title").html(title);
        if( body !== undefined ) $("#login-error-body").html(body);
        if( subtext !== undefined ) $("#login-error-subtext").html(subtext);

        $("#login-section-login").hide();
        $("#login-section-error").show();
        $("#loginPanel").addClass("login-panel-error");
        $("#loginButton").show();
        $(".login-loader").hide();
    }

    function loginSmalError(msg) {
        if( msg === undefined || msg == "" ) {
            $("#login-error-small").hide();
            return;
        }

        $("#login-error-small").html(msg);
        $("#login-error-small").show();
    }

    function strToPlan(str) {
        var r = str.toString().trim();
        if( r == "noplan" ) return null;
        return {
            id: r.split(':')[1].split(';')[0],
            expireTS: r.split(':')[1].split(';')[1],
            status: r.split(':')[1].split(';')[2],
            canceled: parseInt(r.split(':')[1].split(';')[3]),
            cardnr: r.split(':')[1].split(';')[4],
            extendedOfferUsed: parseInt(r.split(':')[1].split(';')[5]),
            created: parseInt(r.split(':')[1].split(';')[6])
        };
    }

    function myPages(nuid, username, password) {
        var errorNorm = [
            "HOPPSAN!",
            "Mina sidor är en tjänst för dig som köpt en prenumeration direkt här på hemsidan." ];

        firebase.database().ref('/users/'+nuid).once('value').then(function(snap) {
            if (snap.exists()) {
                var userdata = snap.val();
                firebase.database().ref('/userData/'+nuid).once('value').then(function(p) {
                    var ud = p.val();
                    var purchase = ud.purchases;
                    var purchaseStripe = ud.purchasesStripe;
                    if( purchase !== null && userdata.premium == true && purchase.receipt && 
                        ((purchase.receipt.length !== undefined && purchase.receipt.substring(0,4) == "cus_" ) ||
                         (purchaseStripe !== undefined && purchaseStripe.receipt !== undefined && purchaseStripe.receipt.substring(0,4) == "cus_"))) {
                        $.post('/api/lgin.php',{uid:nuid}, function(r) {
                            document.cookie = "username=" + username;
                            window.location.href = "/mina-sidor/";
                        });
                    }
                    else {
                        loginError(errorNorm[0], errorNorm[1]);
                    }
                });
            }
            else {
                console.log("no user");
            }
        });
    }

    function updateCard(callback, restore) {
        if( _stripe != null ) {
            _stripe.createToken(_card).then(function(r) {
                if (r.error) {
                    restore();
                    $("#card-errors").html(r.error.message);
                } else {
                    var customer = $("#current-stripe-customer").val();
                    $.post(paymentBackend + "updateCard", {stripeToken: r.token.id, stripeCustomer: customer}, function(r) {
                        if( r.toString().trim() == "OK" ) {
                            restore();
                            callback();
                        }
                        else {
                            $("#card-errors").html("Kortet kunde inte bekräftas, kontrollera uppgifterna");
                            restore();
                        }
                    })
                    .fail(function(r) {
                        $("#card-errors").html("Problem att uppdatera uppgifterna, kontrollera CVC");
                        restore();
                    });
                }
            });
        }
    }
    
    function updatePlan(customer, newplan) {
        $.post(paymentBackend + "changePlan", {stripeCustomer:customer, stripePlan:newplan}, function(r) {
            if( r.toString().trim() == "OK" ) {
                $("#changePlanConfirmButton").show();
                $("#cancelLink").show();
                $("body").css('cursor', '');

                changePlanPage(6);
            }
        })
        .fail(function(r) {
            $("#changePlanConfirmButton").show();
            $("#cancelLink").show();
            $("body").css('cursor', '');
            alert("Kunde inte ändra din prenumeration, kontakta supporten (felkod: P5:6)");
        });
    }