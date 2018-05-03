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
})
$('#Synagogue-select').change(function() {
    console.log("Yeah");
    if ($(this).find("option:selected").attr("id") == "option-other") {
        $('#other-input-place').html('<input type="text" placeholder="Other Synagogue" id="otherSynagogueInput">');
    }
})
function showSubscriptionOptions() {
    $('#main-form').html('<h4 style="width: 100%; text-align: center;">Subscription Preferences:</h4><div id="subscriptionsView"><h3>SCA Affiliates:</h3><div id="SCA-Affiliates"></div><h3>Other Must Reads:</h3><div id="Other"></div></div><button type="button" onclick="showLoginForm()">Login</button><button type="button" onclick="showSignUpForm()">Sign Up</button>')
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
    $('#main-form').html('<input type="email" autocomplete="email" placeholder="email" id="email-login"><input type="password" autocomplete="password" placeholder="Password" id="password-login"><button type="button" onclick="signUserIn()">Sign In</button>');
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
    $('#main-form').html(`<h1 style="width: 100%; text-align: center; margin-bottom: 40px;">Sign Up</h1><input type="text" autocomplete="given-name" placeholder="First Name" id="firstName-signup"><input type="text" autocomplete="family-name" placeholder="Last Name" id="lastName-signup"><input type="email" autocomplete="email" placeholder="Email Address" id="email-signup"><input type="text" autocomplete="postal-code" placeholder="Zip Code" id="zip-signup"><input type="password" autocomplete="password" placeholder="Password" id="password-signup"><input type="password" autocomplete="password" placeholder="Confirm Password" id="confirmedPassword-signup"><select id="Synagogue-select" placeholder="Synagogue Affiliation">
        <option disabled selected>Synagogue Affiliation</option>
        <option>Ahba Ve Ahva</option>
        <option>Ave N Sephardic Congregation</option>
        <option>Bet Rachel</option>
        <option>Beth Torah</option>
        <option>Bnei Yitzchak</option>
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
    <div id="other-input-place"></div><button type="button" onclick="handleNewSignUp()">Submit</button>`);
}
function showUsersSubscriptionOptions() {
    if (firebase.auth().currentUser) {
        $('#main-form').html(`<h3 style="width: 100%; text-align: center;">${firebase.auth().currentUser.displayName}'s Subscriptions:</h3>
                        <div id="subscriptionsView">
                            <h3>SCA Affiliates:</h3>
                            <div id="SCA-Affiliates"></div>
                            <h3>Other Must Reads:</h3>
                            <div id="Other"></div>
                        </div>
                        <button onclick="pushUserSubscriptionChanges()">Confirm Changes</button>
                        <p class="message">Not ${firebase.auth().currentUser.displayName}? <a onclick="logUserOut()">Log Out</a></p>`);
        loadUsersSubscriptions();
    } else {
        console.log('user is null?')
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
    if (passwordsMatch && allFilledOut) {
        auth.createUserWithEmailAndPassword(emailAddress, password)
        .then(function() {
            auth.signInWithEmailAndPassword(emailAddress, password)
            .then(function() {
                database.ref("Users/" + firebase.auth().currentUser.uid).set({
                    FirstName: firstName,
                    LastName: lastName,
                    Email: emailAddress,
                    Zipcode: zipcode,
                    Synagogue: synagogue
                });
                firebase.auth().currentUser.updateProfile({
                    displayName: firstName
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
function subscriptionData() {
    data = {}
    const inputs = document.getElementsByClassName('subscription');
    Array.prototype.forEach.call(inputs, function(input) {
        data[input.id] = input.checked;
    })
    return data;
}
function loadUsersSubscriptions() {
    database.ref('SubcriptionOptions').on('value', function(snapshot) {
        const affiliates = document.getElementById('SCA-Affiliates');
        const other = document.getElementById('Other');
        while (affiliates.lastChild) {
            affiliates.removeChild(affiliates.lastChild);
        }
        while (other.lastChild) {
            other.removeChild(other.lastChild);
        }
        snapshot.forEach(function(child) {
            const author = child.val().Author.toString();
            const title = child.val().Title.toString();
            const category = child.val().Category.toString();
            const subscriptionKey = child.key;
            const span = document.createElement('span');
            const input = document.createElement('INPUT');
            const desc = document.createTextNode(`${author}: ${title}`);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('id', subscriptionKey);
            input.setAttribute('class', 'subscription');
            span.appendChild(input);
            span.appendChild(desc);
            span.appendChild(document.createElement('br'));
            if (category == "Affiliates") {
                affiliates.appendChild(span);
            } else if (category == "Other") {
                other.appendChild(span);
            }
        })
        database.ref("Users/" + firebase.auth().currentUser.uid).once('value', function(snapshot) {
            console.log('this also ran')
            const subscriptions = snapshot.val().Subscriptions;
            if (subscriptions) {
                const keys = Object.keys(subscriptions);
                for (var i = 0; i < keys.length; i++) {
                    if (subscriptions[keys[i]]) {
                        $(`#${keys[i]}`).prop('checked', true);
                    }
                }
            }
        })
    })
}
function pushUserSubscriptionChanges() {
    console.log('this supposedly happened')
    database.ref('Users/'+firebase.auth().currentUser.uid+"/Subscriptions").set(subscriptionData())
    alert('Your subscription preferences have been saved.');
}

auth.onAuthStateChanged(function(user) {
    if (user) {
        if (user.emailVerified) {
            console.log('showing subscriptions')
            showUsersSubscriptionOptions();
        } else {
            $('#main-form').html(`<h3>We've created your account, ${user.displayName}</h3><h4>Please verify your email address to continue.</h4><button onclick="sendVerificationEmail()">Send Verification Email</button>`);
        }
    } else {
        showSubscriptionOptions();
    }
})
function sendVerificationEmail() {
    firebase.auth().currentUser.sendEmailVerification().then(function() {
        alert(`Verification email sent to ${firebase.auth().currentUser.email}`);
    }).catch(function(error) {
        alert(error.message);
    });
}

// function editSubscriptions() {
//     const emailAddress = document.getElementById('editemail').value.toLowerCase();
//     if (emailAddress == "") {
//         alert("Email address field cannot be empty.");
//     } else {
//         database.ref("Subscribers").orderByChild("Email").equalTo(emailAddress).once("value", snapshot => {
//             if (snapshot.val()) {
//                 const userKey = snapshot.val()[Object.keys(snapshot.val())];
//                 document.getElementById('email').value = emailAddress;
//                 const zipcode = userKey.ZipCode;
//                 const subscriptions = userKey.Subscriptions;
//                 const subKeys = Object.keys(subscriptions);
//                 for (var i = 0; i < subKeys.length; i++) {
//                     document.getElementById(`${subKeys[i]}`).checked = subscriptions[subKeys[i]];
//                 }
//                 document.getElementById('zipcode').value = zipcode;
//                 document.getElementById('subscribeButton').innerHTML = "Confirm Changes";
//                 toggleForm();
//
//             } else {
//                 alert('The email address entered is not registered for subscriptions.\nPlease register and then choose subscriptions.')
//             }
//         });
//     }
// }
//
// function pushChanges() {
//     if (requiredFieldsAreFilledOut()) {
//         const emailAddress = document.getElementById('email').value.toLowerCase();
//         const zip = document.getElementById('zipcode').value;
//         var subID = "";
//         const newSubs = subscriptionData();
//         // Look for subscriber with email matching the one entered
//         database.ref("Subscribers").orderByChild("Email").equalTo(emailAddress).once("value", snapshot => {
//             const subscriberObj = snapshot.val();
//             // If the subscriber with specified email exists, change subID to be whatever the id is for that subscriber
//             if (subscriberObj) {
//                 subID = Object.keys(subscriberObj)[0].toString();
//                 const oldSubs = subscriberObj[subID].Subscriptions;
//                 updateDBStats(oldSubs, newSubs);
//                 // Removes email from zip code in case it changed
//                 database.ref(`Zipcodes/${subscriberObj[Object.keys(subscriberObj)].ZipCode}/${subID}`).remove();
//             } else {
//                 // Otherwise create a new subID for the subscriber
//                 subID = database.ref("Subscribers").push().key;
//                 addDBStats(newSubs);
//             }
//             database.ref(`Subscribers/${subID}`).set({
//                 Email: emailAddress,
//                 ZipCode: zip,
//                 Subscriptions: newSubs
//             });
//             database.ref(`Zipcodes/${zip}/${subID}`).set(emailAddress);
//             alert("Your subscription preferences have been saved.");
//         })
//     } else {
//         alert("Please make sure all fields are filled out.");
//     }
// }
// function updateDBStats(oldSubs, newSubs) {
//     Object.keys(oldSubs).forEach(function(oldSubKey) {
//         const ref = database.ref(`SubcriptionOptions/${oldSubKey}/Subscribers`);
//         if (oldSubs[oldSubKey] == true && newSubs[oldSubKey] != true) {
//             ref.once('value', function(snapshot) {
//                 ref.set(snapshot.val() - 1);
//             });
//         } else if (oldSubs[oldSubKey] != true && newSubs[oldSubKey] == true) {
//             ref.once('value', function(snapshot) {
//                 ref.set(snapshot.val() + 1);
//             });
//         }
//     });
// }
// function addDBStats(newSubs) {
//     Object.keys(newSubs).forEach(function(newSubKey) {
//         if (newSubs[newSubKey] == true) {
//             const ref = database.ref(`SubcriptionOptions/${newSubKey}/Subscribers`);
//             ref.once('value', function(snapshot) {
//                 ref.set(snapshot.val() + 1);
//             });
//         }
//     })
// }
