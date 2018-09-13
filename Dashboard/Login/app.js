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

function login() {
    let email = $('#login-email').val();
    let password = $('#login-pass').val();
    if (email && password) {
        auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.replace('../');
        })
        .catch((error) => {
            alert("Something went wrong... " + error.message);
        });
    } else {
        alert('Ensure email and password fields are filled out before continuing.');
    }
}