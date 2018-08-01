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
var auth = firebase.auth();
var database = firebase.database();

$(document).ready(function() {
    $('#loginButton').on('click', login)
})

function login() {
    let email = $('#login-email').val();
    let password = $('#login-pass').val();

    if (email != "" && password != "") {
        auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            database.ref('Authors').once('value', snapshot => {
                if (Object.keys(snapshot.val()).includes(auth.currentUser.uid)) {
                    window.location.assign('../AuthorDashboard/')
                } else {
                    alert('According to our records, you are not an authorized author for the Shabbat Shalom Reader.');
                }
            });
        }).catch(error => alert(error));
    } else {
        alert('Please enter your email and password before continuing.');
    }
}
function sendPasswordReset() {
    let email = $('#login-email').val();
    if (email != "") {
        auth.sendPasswordResetEmail(email).then(() => {
            alert("We've sent a password reset link to " + email);
        }).catch(error => alert(error.message));
    } else {
        alert('Please enter your email address.');
    }
}