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
var storage = firebase.storage();
var auth = firebase.auth();

$(document).ready(function() {
    $('#fileInput').on('change', changeBGImg);
    $('#uploadButton').on('click', uploadPDF);
    $('#removeButton').on('click', removePDF);
});

auth.onAuthStateChanged(user => {
    if (user) {
        loadStuff();
    }
});
function changeBGImg() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $(`.PrevImg`).css('background-image', `url(${e.target.result})`);
            $('#uploadButton').show();
        }
        reader.readAsDataURL(this.files[0]);
    }
}
function uploadPDF() {
    const file = $('#fileInput').prop('files')[0];
    var uploadTask = storage.ref('PDFs/').child(auth.currentUser.uid).put(file);

    uploadTask.on('state_changed', function(snapshot) {
        let progress = Math.floor(snapshot.bytesTransferred / snapshot.totalBytes * 100);
        $('#ProgressStatus').text(`Uploading... ${progress}%`);
        $('#uploadButton').hide();
    }, function(error) {
        $('.TopGradient').css('background', 'linear-gradient(rgb(255, 152, 152), rgba(255, 152, 152, 0.2))');
        $('#ProgressStatus').text('Upload Failed');
        alert(error.message);
    }, function() {
        $('.TopGradient').css('background', 'linear-gradient(rgb(152, 251, 152), rgba(152, 251, 152, 0.2))');
        $('#ProgressStatus').text('Uploaded Successfully');
        $('#removeButton').show();
        uploadTask.snapshot.ref.getDownloadURL().then(function(url) {
            database.ref(`SubcriptionOptions/${auth.currentUser.uid}/DownloadURL`).set(url);
        });
    });
}
function removePDF() {
    storage.ref(`PDFs/${auth.currentUser.uid}`).delete()
    .then(() => {
        database.ref(`SubcriptionOptions/${auth.currentUser.uid}/DownloadURL`).remove()
        .then(() => {
            $('.PrevImg').css('background-image', 'none');
            $('.ProgressStatus').text('');
            $('.TopGradient').css('background', 'linear-gradient(rgba(0,0,0, 0.5), rgb(255,255,255))');
            $('#removeButton').hide();
        }).catch(error => {
            alert(error.message);
        })
    }).catch(error => {
        alert(error.message);
    });
}
function loadStuff() {
    $('#userEmail').text('Author: ' + auth.currentUser.email);
    database.ref('SubcriptionOptions/' + auth.currentUser.uid).once('value', snapshot => {
        let val = snapshot.val();
        if (Object.keys(val).includes('DownloadURL')) {
            $('.PrevImg').css('background-image', `url('${val.DownloadURL}')`);
            $('#removeButton').show();
        }
    });
}