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
window.onload = initializeSubscribeForm;

function toggleForm() {
     $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
}
function initializeSubscribeForm() {
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
    })
    toggleForm();
}


function requiredFieldsAreFilledOut() {
    if (document.getElementById('email').value == "") {return false}
    if (document.getElementById('zipcode').value == "") {return false}
    var atLeastOnecheckboxIsSelected = false;
    const inputs = document.getElementsByClassName('subscription');
    Array.prototype.forEach.call(inputs, function(input) {
        if (input.checked) {
            atLeastOnecheckboxIsSelected = true;
        }
    })
    return atLeastOnecheckboxIsSelected
}
function editSubscriptions() {
    const emailAddress = document.getElementById('editemail').value.toLowerCase();
    if (emailAddress == "") {
        alert("Email address field cannot be empty.");
    } else {
        database.ref("Subscribers").orderByChild("Email").equalTo(emailAddress).once("value", snapshot => {
            if (snapshot.val()) {
                const userKey = snapshot.val()[Object.keys(snapshot.val())];
                document.getElementById('email').value = emailAddress;
                const zipcode = userKey.ZipCode;
                const subscriptions = userKey.Subscriptions;
                const subKeys = Object.keys(subscriptions);
                for (var i = 0; i < subKeys.length; i++) {
                    document.getElementById(`${subKeys[i]}`).checked = subscriptions[subKeys[i]];
                }
                document.getElementById('zipcode').value = zipcode;
                document.getElementById('subscribeButton').innerHTML = "Confirm Changes";
                toggleForm();

            } else {
                alert('The email address entered is not registered for subscriptions.\nPlease register and then choose subscriptions.')
            }
        });
    }
}

function pushChanges() {
    if (requiredFieldsAreFilledOut()) {
        const emailAddress = document.getElementById('email').value.toLowerCase();
        const zip = document.getElementById('zipcode').value;
        var subID = "";
        const newSubs = subscriptionData();
        // Look for subscriber with email matching the one entered
        database.ref("Subscribers").orderByChild("Email").equalTo(emailAddress).once("value", snapshot => {
            const subscriberObj = snapshot.val();
            // If the subscriber with specified email exists, change subID to be whatever the id is for that subscriber
            if (subscriberObj) {
                subID = Object.keys(subscriberObj)[0].toString();
                const oldSubs = subscriberObj[subID].Subscriptions;
                updateDBStats(oldSubs, newSubs);
                // Removes email from zip code in case it changed
                database.ref(`Zipcodes/${subscriberObj[Object.keys(subscriberObj)].ZipCode}/${subID}`).remove();
            } else {
                // Otherwise create a new subID for the subscriber
                subID = database.ref("Subscribers").push().key;
                addDBStats(newSubs);
            }
            database.ref(`Subscribers/${subID}`).set({
                Email: emailAddress,
                ZipCode: zip,
                Subscriptions: newSubs
            });
            database.ref(`Zipcodes/${zip}/${subID}`).set(emailAddress);
            alert("Your subscription preferences have been saved.");
        })
    } else {
        alert("Please make sure all fields are filled out.");
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
function updateDBStats(oldSubs, newSubs) {
    Object.keys(oldSubs).forEach(function(oldSubKey) {
        const ref = database.ref(`SubcriptionOptions/${oldSubKey}/Subscribers`);
        if (oldSubs[oldSubKey] == true && newSubs[oldSubKey] != true) {
            ref.once('value', function(snapshot) {
                ref.set(snapshot.val() - 1);
            });
        } else if (oldSubs[oldSubKey] != true && newSubs[oldSubKey] == true) {
            ref.once('value', function(snapshot) {
                ref.set(snapshot.val() + 1);
            });
        }
    });
}
function addDBStats(newSubs) {
    Object.keys(newSubs).forEach(function(newSubKey) {
        if (newSubs[newSubKey] == true) {
            const ref = database.ref(`SubcriptionOptions/${newSubKey}/Subscribers`);
            ref.once('value', function(snapshot) {
                ref.set(snapshot.val() + 1);
            });
        }
    })
}
