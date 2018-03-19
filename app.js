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


function toggleForm() {
     $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
}
function requiredFieldsAreFilledOut() {
    if (document.getElementById('email').value == "") {return false}
    if (document.getElementById('zipcode').value == "") {return false}
    var atLeastOnecheckboxIsSelected = false;
    for (var i = 1; i <= 4; i++) {
        if (document.getElementById(`sub-${i}`).checked == true) {
            atLeastOnecheckboxIsSelected = true;
        }
    }
    return atLeastOnecheckboxIsSelected
}
function editSubscriptions() {
    const emailAddress = document.getElementById('editemail').value;
    if (emailAddress == "") {
        alert("Email address field cannot be empty.");
    } else {
        database.ref("Subscribers").orderByChild("Email").equalTo(emailAddress).once("value",snapshot => {
            const data = snapshot.val();
            if (data) {
                document.getElementById('email').value = emailAddress;
                const zipcode = data[Object.keys(data)].ZipCode;
                const subscriptions = data[Object.keys(data)].Subscriptions;
                const subKeys = Object.keys(subscriptions);
                for (var i = 0; i < subKeys.length; i++) {
                    document.getElementById(`sub-${i+1}`).checked = subscriptions[subKeys[i]];
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
        const emailAddress = document.getElementById('email').value;
        const zip = document.getElementById('zipcode').value;
        var subID = "";
        // Look for subscriber with email matching the one entered
        database.ref("Subscribers").orderByChild("Email").equalTo(emailAddress).once("value", snapshot => {
            const subscriberObj = snapshot.val();
            // If the subscriber with specified email exists, change subID to be whatever the id is for that subscriber
            if (subscriberObj) {
                subID = Object.keys(subscriberObj)[0].toString();
                // Removes email from zip code in case it changed
                database.ref(`Zipcodes/${subscriberObj[Object.keys(subscriberObj)].ZipCode}/${subID}`).remove();
            } else {
                // Otherwise create a new subID for the subscriber
                subID = database.ref("Subscribers").push().key;
            }
            database.ref(`Subscribers/${subID}`).set({
                Email: emailAddress,
                ZipCode: zip,
                Subscriptions: {
                    Rabbi1: document.getElementById('sub-1').checked,
                    Rabbi2: document.getElementById('sub-2').checked,
                    Rabbi3: document.getElementById('sub-3').checked,
                    Rabbi4: document.getElementById('sub-4').checked
                }
            });
            database.ref(`Zipcodes/${zip}/${subID}`).set(emailAddress);
            alert("Your subscription preferences have been saved.");
        })
    } else {
        alert("Please make sure all fields are filled out.");
    }
}
