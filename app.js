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
const API_URL = 'https://sca-email-server.herokuapp.com'
// const API_URL = 'http://localhost:5000';

const isSubscribedRef = (userId) => `Users/${userId}/isSubscribed`;

// $('#Synagogue-select').on('change', () => {
//      if ($('#option-other').is(':selected')) {
//         $('#other-input-place').html('<input type="text" placeholder="Other Synagogue" id="otherSynagogueInput">');
//     }
// })

$(document).on('change', '#Synagogue-select', function() {
    if ($('#option-other').is(':selected')) {
        $('#other-input-place').html('<input type="text" placeholder="Other Synagogue" id="otherSynagogueInput">');
    }
});
function scrollToTop() {
    window.scrollTo(0,0);
    if (window.parent) {
        window.parent.postMessage('Scroll', "*");
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
        <option>Ohel Yishak of Allenhurst</option>
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
        <p class="message">Want to update your email address? <a onclick="showEmailResetField();">Click Here<a/>
        <div id="subscription-state-toggle"></div>
        `);
        
        loadUsersSubscriptions();
        populateUnsubscribeButton();
    } else {
        console.log('user is null?')
    }
}

function populateUnsubscribeButton() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    database.ref(isSubscribedRef(currentUser.uid)).on('value', (snapshot) => {
        const isSubscribed = snapshot.val() ?? true;
        const subscriptionStateToggle = $('#subscription-state-toggle');
        if (isSubscribed) {
            subscriptionStateToggle.html(`<p class="message">No longer want to receive emails from us? <a onClick="unsubscribe()">Unsubscribe</a></p>`);
        } else {
            subscriptionStateToggle.html(`<p class="message">You're not subscribed to these emails - <a onClick="resubscribe()">Resubscribe</a></p>`)
        }
    });
}

function unsubscribe() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    database.ref(isSubscribedRef(currentUser.uid)).set(false);
}

function resubscribe() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    database.ref(isSubscribedRef(currentUser.uid)).set(true);
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
            alert(`Your email was successfully changed from ${oldEmail} to ${$('#newEmailForUser').val()}`);
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
//     $.post('API_URL/onDemand', {email: auth.currentUser.email}, function (data) {
//         alert(`We're preparing your pdf. You should recieve it at ${auth.currentUser.email} shortly.`);
//     });
// }
function getMyPDF() {
    showSpinner();
    $.post(`${API_URL}/pdfNow`, {email: auth.currentUser.email}, function(data, status) {
        $('#loadingWidget').hide();
        $('#overlay').hide();
        if (status == "success") {
            console.log('sucess');
            if (data.slice(0, 13) == "We appologize") {
                alert(data);
            } else {
               downloadStitchedPDF();
            }
        } else {
            alert(status);
        }
    });
}
function downloadAllUploadedPdfs() {
    showSpinner();
    $.get(`${API_URL}/all-uploaded-pdfs`, function (data, status) {
        $('#loadingWidget').hide();
        $('#overlay').hide();
        if (status === "success") {
            if (data.slice(0, 13) === "We appologize") {
                alert(data);
            } else {
                downloadStitchedPDF();
            }
        }
    })
}
function downloadStitchedPDF() {
    if(window.isOnMobileOrTablet()) {
        $('#downloadLink').prop('href', `data:application/pdf;base64,${data}`);
        $('#downloadPopup').show();
    } else {
        let link = document.createElement('a');
        link.href = `${API_URL}/merged`;
        link.download = "ShabbatShalom.pdf";
        link.click();
    }
}
function closePDFPopup() {
    $('#downloadPopup').hide();
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
            $('.AuthenticatedButtons').show();
            $('.UnauthenticatedButtons').hide();
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
        $('.AuthenticatedButtons').hide();
        $('.UnauthenticatedButtons').show();
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
function showSpinner() {
    $('#loadingWidget').css('display', 'flex');
    document.getElementById('overlay').style.display = 'block';
}

window.isOnMobileOrTablet = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };