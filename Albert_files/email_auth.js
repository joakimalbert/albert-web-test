/**
 * Created by HarinderSinghDeepak on 16/11/18.
 * 
 */

var SITE_URL_EMAIL = window.location.origin;

var emailBackendBase = ENVIRONMENT === ENVIRONMENTS.production
    ? 'https://albert-receipt-auth.herokuapp.com'
    : 'https://albert-be-sandbox.herokuapp.com';

var paymentBackend = SITE_URL_EMAIL+'/api/index.php/';

jQuery(document).ready(function($) 
{
    jQuery(document).on('click', '#registerEmailUser', function (e) {
        e.preventDefault();
        registerForm($(this).parent('form'));
        return false;
    });

    jQuery(document).on('keypress', "#userEmail", function(e) {
        if( e.keyCode == 13 ) {
            e.preventDefault();
            registerForm(jQuery(this).parent('form'));
            return false;
        }
    });

    $('#matsmart-btn').on('click', function(e) {
        e.preventDefault();
        registerMatsmart($(this).parents('form'));
        return false;
    });

    jQuery(document).on('keypress', "#emailMatsmart", function(e) {
        if( e.keyCode == 13 ) {
            e.preventDefault();
            registerMatsmart(jQuery(this).parents('form'));
            return false;
        }
    });

    $('#influencer-btn').on('click', function(e) {
        e.preventDefault();
        registerInfluencer($(this).parents('form'));
        return false;
    });

    $("#emailInfluencer").on('keypress', function(e)
    {
        if( e.keyCode == 13 ) {
            e.preventDefault();
            registerInfluencer($(this).parents('form'));
        }
    });

    $("#startPayment").click(function(e) {
        e.preventDefault();
        runStripeV3Payment();
        return false;
    });
});


function registerForm(currentForm)
{
    var acceptedTerms = jQuery(currentForm).find('input:checkbox').is(':checked');
    var errors = 0;
    jQuery('.registrationError').html('');

    if(!jQuery(currentForm).find('input:radio.classType').is(':checked'))
    {
        jQuery('.registrationError').append('Select plan.');
        return false;
    }

    if( jQuery(currentForm).find('#userEmail').val().trim() == '') {
        jQuery('.registrationError').append('Fyll i e-postaddress');
        return false;
    }

    if( !isValidEmailAddress(jQuery(currentForm).find('#userEmail').val()) ) {
        jQuery('.registrationError').append('Fyll i en korrekt e-postaddress.');
        return false;
    }

    if( ! acceptedTerms ){
        jQuery('.registrationError').append('Du måste godkänna Albert\'s medlemsvillkor<br/>');
        return false;
    }
    var emailAddr = jQuery(currentForm).find('#userEmail').val().trim();
    var stripePlan = jQuery(currentForm).find('input:radio.classType:checked').val();

    jQuery.post(emailBackendBase + '/email/checkPremium', {"email":emailAddr}, function(response) {
        if( response === true ) {
            jQuery('.registrationError').append('Du är redan premiumkund. Inget nytt köp behövs.<br/>');
            errors++;
        }
    }).always(function() {
        if( ! errors ) {
            var context = 'Edimia';
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

            loadScreenOff();
            document.cookie = "emailAddr=" + emailAddr + "; path=/";
            document.cookie = "stripePlan=" + stripePlan + "; path=/";
            document.cookie = "landingpage=parentemailregister; path=/";

            (stripePlan == 'class_nursery_four' ? sessionStorage.setItem('edimiaModal', true) : sessionStorage.clear('edimiaModal') );
            
            window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/')) + "/checkout/";
        }
    });
}

function registerMatsmart(currentForm)
{
    var acceptedTerms = jQuery(currentForm).find('input:checkbox#checkbox-3').is(':checked');
    var errors = 0;
    jQuery('.registrationError').html('');

    if( jQuery(currentForm).find('#emailMatsmart').val().trim() == '') {
        jQuery('.registrationError').append('Fyll i e-postaddress');
        return false;
    }

    if( !isValidEmailAddress(jQuery(currentForm).find('#emailMatsmart').val()) ) {
        jQuery('.registrationError').append('Fyll i en korrekt e-postaddress.');
        return false;
    }

    var classType = jQuery(currentForm).find('input:radio.classType').is(':checked');
    if( ! classType ){
        jQuery('.registrationError').append('Vänligen välj den årskursgrupp som passar ditt barn.');
        return false;
    }

    if( ! acceptedTerms ){
        jQuery('.registrationError').append('Du måste godkänna Alberts medlemsvillkor<br/>');
        return false;
    }

    var emailAddr = jQuery(currentForm).find('#emailMatsmart').val().trim();
    var stripePlan = jQuery(currentForm).find('input:radio.classType:checked').val();
    loadScreenOn();
    jQuery.post(emailBackendBase + '/email/checkPremium', {"email":emailAddr}, function(response) {
        if( response === true ) {
            jQuery('.registrationError').append('Det angivna telefonnumret är redan en Premiumanvändare, inget köp behövs utföras<br/>');
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

            document.cookie = "emailAddr=" + emailAddr + "; path=/";
            document.cookie = "stripePlan=" + stripePlan + "; path=/";
            document.cookie = "landingpage=matsmart; path=/";
            (stripePlan == 'class_edimia' ? sessionStorage.setItem('edimiaModal', true) : sessionStorage.clear('edimiaModal') );
            
            window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/')) + "/checkout/";
        }
        loadScreenOff();
    });
}

function registerInfluencer(currentForm)
{
    localStorage.clear();
    sessionStorage.clear();

    var acceptedTerms = $(currentForm).find('input:checkbox').is(':checked');
    var errors = 0;
    $('.registrationError').html('');

    if( $(currentForm).find('#code').val().trim() == '') {
        $('.registrationError').append('Fyll i din kod<br/>');
        return false;
    }

    if( jQuery(currentForm).find('#emailInfluencer').val().trim() == '') {
        jQuery('.registrationError').append('Fyll i e-postaddress');
        return false;
    }

    if( !isValidEmailAddress(jQuery(currentForm).find('#emailInfluencer').val()) ) {
        jQuery('.registrationError').append('Fyll i en korrekt e-postaddress.');
        return false;
    }

    if($(currentForm).find('input:radio.classType:checked').length == 0)
    {
        $('.registrationError').append('För att skapa ditt konto välj årskurs i listan');
        return false;
    }

    if( ! acceptedTerms ){
        $('.registrationError').append('Du måste godkänna Alberts medlemsvillkor<br/>');
        return false;
    }
    var emailAddr = $(currentForm).find('#emailInfluencer').val();
    var codeNr = $(currentForm).find('#code').val().trim();
    var stripePlan = jQuery(currentForm).find('input:radio.classType:checked').val();

    loadScreenOn();

    codeNr = codeNr.toLowerCase();
    if(codeNr == 'hofp')
    {
        if(codeNr == 'hofp')
        {
            codeNr = 'houseofphilia';
        }
        
        $.post(SITE_URL_EMAIL+"/api/influencer.php", {method : 'emailPremiumCheck', data : { email : emailAddr }}, function(retData) {
            var res = JSON.parse(retData);

            if(res.status == "401")
            {
                loadScreenOff();
                $('.registrationError').html("Du hittade inte");
            }
            else if(res.status == "406")
            {
                loadScreenOff();
                $('.registrationError').html("Du hittade inte");
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
                 
                document.cookie = "landingpage=influencer; path=/";

                if(res.status == "300")
                {
                    var customerId = res.customer;
                    $.post(paymentBackend + "addInfluencerDiscount", {stripeCustomer: customerId, coupon : codeNr}, function(retData) {
                        if(retData == "OK")
                        {
                            sessionStorage.setItem('influencerModule', true);
                            sessionStorage.setItem('influencerModuleType', stripePlan);

                            window.location.href = SITE_URL_EMAIL+'/congratse';
                        }
                        else {
                            loadScreenOff();
                            alert("Något gick fel, kontakta suporten");
                        }
                    });
                }
                else
                {
                    document.cookie = "emailAddr=" + emailAddr + "; path=/";
                    document.cookie = "influencerCode=" + codeNr + "; path=/";
                    document.cookie = "stripePlan=" + stripePlan + "; path=/";
                    (stripePlan == 'class_edimia' ? sessionStorage.setItem('edimiaModal', true) : sessionStorage.clear('edimiaModal') );
                    
                    sessionStorage.setItem('influencerModule', true);
                    sessionStorage.setItem('influencerModuleType', stripePlan);

                    window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf('/')) + "/checkout/";
                }
            }
            else {
                loadScreenOff();
                alert("Något gick fel, kontakta suporten");
            }
        });
    }
    else{
        loadScreenOff();
        $('.registrationError').html('Ogiltig kod');
    }
    
}

function forgotPassword(emailAddr)
{
    jQuery.post(emailBackendBase + "/email/forgot-password", {email: emailAddr}, function(r) {
        loginSmalError("Ett email med nytt lösenord kommer snart.");
        jQuery("#login-section-login").toggle();
        jQuery("#login-section-forgot-password").toggle();
    }).fail(function(r) {
        loginError("OOPS!", "Användare finns inte.");
    });
}

function loginError(title, body, subtext)
{
    if( title !== undefined ) jQuery("#login-error-title").html(title);
    if( body !== undefined ) jQuery("#login-error-body").html(body);
    if( subtext !== undefined ) jQuery("#login-error-subtext").html(subtext);

    jQuery("#login-section-login").hide();
    jQuery("#login-section-error").show();
    jQuery("#loginPanel").addClass("login-panel-error");
    jQuery("#loginButton").show();
    jQuery(".login-loader").hide();
}

function loginSmalError(msg)
{
    if( msg === undefined || msg == "" ) {
        jQuery("#login-error-small").hide();
        return;
    }

    jQuery("#login-error-small").html(msg);
    jQuery("#login-error-small").show();
}

function loginWithEmail(uname, pwd)
{
    firebase.auth().signInWithEmailAndPassword(uname, pwd)
        .then(function(user) {
            loginToMyPage(user.uid, uname, pwd);
        })
        .catch(function(ex) {
            loginSmalError("Felaktigt email eller lösenord");
            jQuery("#loginButton").fadeIn(250);
            jQuery(".login-loader").hide();
        });
}

function loginToMyPage(nuid, username, password) {
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
                        jQuery.post('/api/lgin.php',{uid:nuid}, function(r) {
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