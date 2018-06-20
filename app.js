// Initialize Firebase
var config = {
    apiKey: "AIzaSyAFYRr1vyPOAx1DU7AMziYGObpZsO1KJkE",
    authDomain: "sca-subscriptions.firebaseapp.com",
    databaseURL: "https://sca-subscriptions.firebaseio.com",
    projectId: "sca-subscriptions",
    storageBucket: "sca-subscriptions.appspot.com",
    messagingSenderId: "1082275540488"
};
firebase.initializeApp(config);
var database = firebase.database();
var auth = firebase.auth();
var user = auth.currentUser;


$(document).on('change', '#Synagogue-select', function() {
    if ($('#option-other').is(':selected')) {
        $('#other-input-place').html('<input type="text" placeholder="Other Synagogue" id="otherSynagogueInput">');
    }
});
function scrollToTop() {
    window.scrollTo(0,0);
    if (window.parent) {
        window.parent.postMessage('Scroll To Top!', "*");
    }
}
$('#Synagogue-select').change(function() {
    if ($(this).find("option:selected").attr("id") == "option-other") {
        $('#other-input-place').html('<input type="text" placeholder="Other Synagogue" id="otherSynagogueInput">');
    }
})
function showSubscriptionOptions() {
    $('#main-form').html(`
    <h1 style="width: 100%; text-align: center; margin-bottom: 40px;">Subscription Options:</h1>
        <div id="subscriptionsView">
            <h3>SCA Affiliates:</h3>
            <div id="SCA-Affiliates"></div>
            <h3>Other Must Reads:</h3>
            <div id="Other"></div>
            <h3>Options</h3>
            <div id="Options">
                <span>Include a link to this week's TanachStudy.com recordings<br><br></span>
                <span>Surprise me: Recieve one additional subscription chosen at random every week<br><br></span>
            </div>
        </div>
        <button type="button" onclick="showLoginForm()">Login</button>
        <button type="button" onclick="showSignUpForm()">Sign Up</button>
    `);

    database.ref('SubcriptionOptions').once('value', function(snapshot) {
        $('#SCA-Affiliates').html("");
        $('#Other').html("");
        snapshot.forEach(function(subscription) {
            const author = subscription.val().Author;
            const title = subscription.val().Title;
            const category = subscription.val().Category;
            const html = `<span>${author}: ${title}<br><br></span>`;
            if (category == "Affiliates") {
                $('#SCA-Affiliates').append(html);
            } else if (category == "Other") {
                $('#Other').append(html);
            }
        });
    });
}
function showLoginForm() {
    $('#TopSignupButton').hide();
    $('#TopSigninButton').hide();
    $('#InviteFriendsButton').hide();
    scrollToTop();
    $('#main-form').html(`
    <h1 style="width: 100%; text-align: center; margin-bottom: 40px;">Login</h1>
    <input type="email" autocomplete="email" placeholder="email" id="email-login">
    <input type="password" autocomplete="password" placeholder="Password" id="password-login">
    <button type="button" onclick="signUserIn()">Sign In</button>
    <p class="message"> Forgot Password? <a onclick="sendPasswordReset()">Reset Password</a></p>
    <p class="message"> Don't have an account? <a onclick="showSignUpForm()">Sign Up</a></p>`);
}
function sendPasswordReset() {
    if ($('#email-login').val() != "") {
        auth.sendPasswordResetEmail($('#email-login').val()).then(function() {
            alert(`We've sent you an email to ${$('#email-login').val()} to change your password.`);
        }).catch(function(error) {
            alert('Something went wrong:\n' + error.message);
        });
    } else {
        alert('Please enter your email address in order to recieve a password reset email.');
    }

}
function signUserIn() {
    auth.signInWithEmailAndPassword($('#email-login').val(), $('#password-login').val())
    .catch(function(error) {
        alert(error.message);
    });
}
function logUserOut() {
    firebase.auth().signOut().catch(function(error) {
        alert(error.message);
    });
}
function showSignUpForm() {
    scrollToTop();
    $('#TopSignupButton').hide();
    $('#TopSigninButton').hide();
    $('#InviteFriendsButton').hide();
    $('#main-form').html(`
        <h1 style="width: 100%; text-align: center; margin-bottom: 40px;">Sign Up</h1>
        <input type="text" autocomplete="given-name" placeholder="First Name" id="firstName-signup">
        <input type="text" autocomplete="family-name" placeholder="Last Name" id="lastName-signup">
        <input type="email" autocomplete="email" placeholder="Email Address" id="email-signup">
        <input type="text" autocomplete="postal-code" placeholder="Zip Code" id="zip-signup">
        <input type="password" autocomplete="password" placeholder="Password" id="password-signup">
        <input type="password" autocomplete="password" placeholder="Confirm Password" id="confirmedPassword-signup">
        <select id="Synagogue-select">
        <option disabled selected>SCA Synagogue Affiliation</option>
        <option>Ahaba Ve Ahva</option>
        <option>Ave N Sephardic Congregation</option>
        <option>Bet Rachel</option>
        <option>Beth Torah</option>
        <option>Bnei Yitzhak</option>
        <option>Congregation Beth Yosef</option>
        <option>Congregation Ohel Yosef of Oakhurst</option>
        <option>Hochama U'Mussar</option>
        <option>Kol Israel Congregation</option>
        <option>Magen David Synagogue</option>
        <option>Magen David of Belle Harbour</option>
        <option>Magen David of West Deal</option>
        <option>Manhattan East Synagogue - Congregation Shaare Mizrah</option>
        <option>Mikdash Eliyahu</option>
        <option>Ohel David and Shlomo Congregation of Manhattan Beach</option>
        <option>Ohel Yishak of Allenhusrt</option>
        <option>Edmond J. Safra Synagogue of Deal</option>
        <option>Edmond J. Safra Synagogue of Manhattan</option>
        <option>Edmond J. Safra Synagogue of Turnberry</option>
        <option>Sephardic Synagogue</option>
        <option>Sephardic Synagogue of Elberon</option>
        <option>Shaare Shalom</option>
        <option id="option-other">Other</option>
        </select>
        <div id="other-input-place"></div>
        <button type="button" onclick="handleNewSignUp()">Submit</button>
        <p class="message">Already have an account? <a onclick="showLoginForm()">Sign In</a></p>
    `);
}
function circle(color) {
    return `<svg width="12" height="10"><circle cx="5" cy="5" r="5" stroke="green" stroke-width="0" fill="${color}" /></svg>`;
}
function showUsersSubscriptionOptions() {
    scrollToTop();
    if (firebase.auth().currentUser) {
        $('#main-form').html(`
        <div style="margin-top: 10px"><span>${circle("green")} = Content Uploaded<br>${circle("red")} = Content not loaded yet</span></div>
        <h3 style="width: 100%; text-align: center;">${firebase.auth().currentUser.displayName}'s Subscriptions:</h3> 
        <div id="subscriptionsView">
            <h3>SCA Affiliates:</h3>
            <div id="SCA-Affiliates"></div>
            <h3>Other Must Reads:</h3>
            <div id="Other"></div>
            <h3>Options</h3>
            <div id="Options"></div>
        </div>
        <button onclick="pushUserSubscriptionChanges()">Confirm Changes</button>
        <p>Your pdf will automatically be delivered on Fridays before noon.<br><br>
        If you wish to receive it sooner, see the green and red indicators above.<br><br>
        The lines that are green indicate that this week's content for that author has already been uploaded.<br>
        The lines that are red indicate that this week's content is not available yet.<br><br>
        If you choose to 'send content now', your pdf will contain content from green authors above.</p>
        <button onclick="getMyPDF()">Download Content Now</button>
        <p class="message">Not ${firebase.auth().currentUser.displayName}? <a onclick="logUserOut()">Log Out</a></p>
        <p class="message">Want to update your email address? <a onclick="showEmailResetField();">Click Here<a/>`);
        
        loadUsersSubscriptions();
    } else {
        console.log('user is null?')
    }
}
function showEmailResetField() {
    $('#main-form').html(`
    <h3 style="width:100%; text-align: center">Change your email address from ${firebase.auth().currentUser.email}, to:</h3>
    <input type="text" id="newEmailForUser" placeholder="Your New Email Address">
    <button onclick="confirmEmailReset()">Confirm</button>
    `);
}
function confirmEmailReset() {
    if ($('#newEmailForUser').val() != "") {
        let oldEmail = firebase.auth().currentUser.email;
        firebase.auth().currentUser.updateEmail($('#newEmailForUser').val()).then(function() {
            database.ref('Users/'+firebase.auth().currentUser.uid).update({"Email": $('#newEmailForUser').val()});
            alert(`Your email was succesfully changed from ${oldEmail} to ${$('#newEmailForUser').val()}`);
            $('#main-form').html(`
                <h3>We've updated your email.</h3>
                <h4>Please verify your new email address to continue.</h4>
                <button onclick="sendVerificationEmail()">Send Verification Email</button>
            `);
        }).catch(function(error) {
            alert(error.message);
        });
    } else {
        alert("New Email Field Can't Be Empty.");
    }
}
function handleNewSignUp() {
    const firstName = $('#firstName-signup').val();
    const lastName = $('#lastName-signup').val();
    const emailAddress = $('#email-signup').val();
    const zipcode = $('#zip-signup').val();
    const password = $('#password-signup').val();
    const confirmedPassword = $('#confirmedPassword-signup').val();
    var synagogue = $('#Synagogue-select option:selected').text();
    if ($('#option-other').is(':selected')) {synagogue = $('#otherSynagogueInput').val()}
    const fields = [firstName, lastName, emailAddress, zipcode];
    const passwordsMatch = password == confirmedPassword;
    const synagogueSelected = $('#Synagogue-select option:selected').text() != "Synagogue Affiliation"
    var allFilledOut = true;
    for (var i = 0; i < fields.length; i++) {if (fields[i] == "") {allFilledOut = false}}
    if (!passwordsMatch) {alert("Passwords do not match.")}
    if (!allFilledOut) {alert("Form not completely filled out.")}
    if (!synagogueSelected) {alert("Please select the synagogue you're affiliated with.")}
    if (passwordsMatch && allFilledOut && synagogueSelected) {
        auth.createUserWithEmailAndPassword(emailAddress, password)
        .then(function() {
            auth.signInWithEmailAndPassword(emailAddress, password)
            .then(function() {
                firebase.auth().currentUser.updateProfile({
                    displayName: firstName
                });
                database.ref("Users/" + firebase.auth().currentUser.uid).set({
                    FirstName: firstName,
                    LastName: lastName,
                    Email: emailAddress,
                    Zipcode: zipcode,
                    Synagogue: synagogue
                });
            })
            .catch(function(error) {
                console.log("Couldn't log user in.");
            })
        })
        .catch(function(error) {
            alert(error.message);
        });
    }
}

// function sendPDFNow() {
//     database.ref('Users/'+firebase.auth().currentUser.uid+"/Subscriptions").set(subscriptionData());
//     $.post('https://sca-email-server.herokuapp.com/onDemand', {email: auth.currentUser.email}, function (data) {
//         alert(`We're preparing your pdf. You should recieve it at ${auth.currentUser.email} shortly.`);
//     });
// }
function getMyPDF() {
    $.post('https://sca-email-server.herokuapp.com/pdfNow', {email: auth.currentUser.email}, function(data, status) {
        if (status == "success") {
            if (data.slice(0, 13) == "We appologize") {
                alert(data);
            } else {
                window.open(`data:application/pdf;base64,${data}`);
            }
        } else {
            alert(status);
        }
    });
}
function subscriptionData() {
    data = {}
    const inputs = document.getElementsByClassName('subscription');
    Array.prototype.forEach.call(inputs, function(input) {
        data[input.id] = input.checked;
    });
    return data;
}
function optionsData() {
    var data = {};
    const inputs = document.getElementsByClassName('ExtraOption');
    Array.prototype.forEach.call(inputs, function(option) {
        data[option.id] = option.checked;
    });
    return data;
}
function loadUsersSubscriptions() {
    database.ref('SubcriptionOptions').on('value', function(snapshot) {
        $('#SCA-Affiliates').html('');
        $('#Other').html('');
        $('#subscriptionsView div').css('margin-left', '-21px');
        snapshot.forEach(function(child) {
            const author = child.val().Author;
            const title = child.val().Title;
            const category = child.val().Category;
            var indicatorColor = "red";
            if (child.val().DownloadURL) {indicatorColor = "green"}
            const circleHTML = `<svg width="20" height="10"><circle cx="5" cy="5" r="5" stroke="green" stroke-width="0" fill="${indicatorColor}" /></svg>`;
            if (category == "Affiliates") {
                $('#SCA-Affiliates').append(`<span>${circleHTML}<input type="checkbox" class="subscription" id="${child.key}">${author}: ${title}<br><br></span>`);
            } else if (category == "Other") {
                $('#Other').append(`<span>${circleHTML}<input type="checkbox" class="subscription" id="${child.key}">${author}: ${title}<br><br></span>`);
            }
        });
        $('#Options').html(`
            <span><svg width="20" height="20"></svg><input class="ExtraOption" type="checkbox" id="WantsTanach">Include a link to this week's TanachStudy.com recordings<br><br></span>
            <span><svg width="20" height="20"></svg><input class="ExtraOption" type="checkbox" id="WantsSurprise">Surprise me: Recieve one additional subscription chosen at random every week<br><br></span>
        `);
        $('#subscriptionsView div span').css({'display': 'inline-block', 'padding-left':'45px', 'text-indent':'-45px'});
        database.ref("Users/" + firebase.auth().currentUser.uid).once('value', function(snapshot) {
            const subscriptions = snapshot.val().Subscriptions;
            const options = snapshot.val().Options;
            if (subscriptions) {
                const keys = Object.keys(subscriptions);
                for (var i = 0; i < keys.length; i++) {
                    if (subscriptions[keys[i]]) {
                        $(`#${keys[i]}`).prop('checked', true);
                    }
                }
            }
            if (options) {
                const optionKeys = Object.keys(options);
                for (var i = 0; i < optionKeys.length; i++) {
                    $(`#${optionKeys[i]}`).prop('checked', options[optionKeys[i]]);
                }
            }
        });
    });
}
function pushUserSubscriptionChanges() {
    database.ref('Users/'+firebase.auth().currentUser.uid+"/Subscriptions").set(subscriptionData())
    database.ref('Users/'+firebase.auth().currentUser.uid+'/Options').set(optionsData())
    alert('Your subscription preferences have been saved.');
}

auth.onAuthStateChanged(function(user) {
    if (user) {
        if (user.emailVerified) {
            showUsersSubscriptionOptions();
        } else {
            scrollToTop();
            $('#main-form').html(`
                <h3>We've created your account.</h3>
                <h4>Please verify your email address to continue.</h4>
                <button onclick="sendVerificationEmail()">Send Verification Email</button>
            `);
            setTimeout(function() {
                $('#main-form').append(`<p class="message">Not ${auth.currentUser.displayName}? <a onclick="logUserOut()">Log out</a></p>`);
            }, 1000);
        }
    } else {
        showSubscriptionOptions();
    }
})
function sendVerificationEmail() {
    firebase.auth().currentUser.sendEmailVerification().then(function() {
        alert(`Verification email sent to ${firebase.auth().currentUser.email}. Once verified, come back and login.`);
        firebase.auth().signOut();
    }).catch(function(error) {
        alert(error.message);
    });
}