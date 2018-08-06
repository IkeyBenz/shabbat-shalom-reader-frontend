var config = {
  apiKey: "AIzaSyAFYRr1vyPOAx1DU7AMziYGObpZsO1KJkE",
  authDomain: "sca-subscriptions.firebaseapp.com",
  databaseURL: "https://sca-subscriptions.firebaseio.com",
  projectId: "sca-subscriptions",
  storageBucket: "sca-subscriptions.appspot.com",
  messagingSenderId: "1082275540488"
};

firebase.initializeApp(config);
document.onload = preloadStuff();

function preloadStuff() {
    setTimeout(function() {
        initializeImageUploaderView();
        toggleStatsBar();
        toggleStatsBar();
    }, 1000);
}

var database = firebase.database();
var storage = firebase.storage();

var lggdIn = false;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var email = user.email;
    const header = document.getElementsByClassName('Header')[0];
    const profileIcon = document.getElementById('profileIcon');
    const displayName = document.createElement('p');
    displayName.innerHTML = email;
    displayName.className = 'icon right';
    displayName.style.color = 'white';
    header.appendChild(displayName);
    hl();
    updateSubscriptionsStatistics();
    lggdIn = true;
    setTimeout(function () {
        profileIcon.style.right = `${displayName.offsetWidth + 30}px`;
    }, 500)
  } else {
    sl();
    lggdIn = false;
  }
});
function hl() {
    const overlay = document.getElementById('Overlay');
    const loginView = document.getElementById('LoginView');
    overlay.style.display = 'none';
    loginView.style.display = 'none';
}
function sl() {
    const overlay = document.getElementById('Overlay');
    const loginView = document.getElementById('LoginView');
    overlay.style.display = 'block';
    loginView.style.display = 'block';
}
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    var successful = true;
    if (email != "" && password != "") {
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(`${errorCode}\n\n${errorMessage}`);
        });
    } else {
        alert('Please make sure all fields are filled out properly.');
    }
}

function toggleStatsBar() {
    if (lggdIn) {
        if (document.getElementById('StatsBar').style.display == "none") {
            loadStats();
            document.documentElement.style.setProperty('--StatsWidth', '300px');
            document.getElementById('StatsBar').style.display = "block";
        } else {
            document.documentElement.style.setProperty('--StatsWidth', '0px');
            document.getElementById('StatsBar').style.display = "none";
        }
    }

    return false;
}
async function updateSubscriptionsStatistics(users) {
    var subscriptionCount = await new Promise(function(resolve, reject) {
        subCount = {};
        database.ref('SubcriptionOptions').once('value', function(subscriptions) {
            subscriptions.forEach(function(subscription) {
                subCount[subscription.key] = 0;
                console.log(subscription.key);
            });
            resolve(subCount);
        });
    });
    var userSubs = [];
    var users = await new Promise(function(resolve,reject) {
        var subscribers = [];
        database.ref('Users').once('value', snapshot => {
            Object.keys(snapshot.val()).forEach(function(key) {
                subscribers.push(snapshot.val()[key]);
            });
            resolve(subscribers);
        });
    });
    for (let user of users) {
        if (user.Subscriptions) {
            userSubs.push(user.Subscriptions);
        }
    }
    for (var i = 0; i < userSubs.length; i++) {
        Object.keys(userSubs[i]).forEach(function(subscriptionKey) {
            if (userSubs[i][subscriptionKey] && Object.keys(subscriptionCount).includes(subscriptionKey)) {
                subscriptionCount[subscriptionKey] += 1;
            }
        });
    }
    Object.keys(subscriptionCount).forEach(function(subscriptionKey) {
        database.ref(`SubcriptionOptions/${subscriptionKey}/Subscribers`).set(subscriptionCount[subscriptionKey]);
    });
    setTimeout(loadStats, 3000);
    
}
function loadStats() {
    database.ref("SubcriptionOptions").on("value", function(snapshot) {
        const statisticsContainer = document.getElementById('StatsContainer');
        while (statisticsContainer.lastChild) {
            statisticsContainer.removeChild(statisticsContainer.lastChild);
        }
        snapshot.forEach(function(child) {
            const stat = document.createElement('h4');
            stat.setAttribute('id', `${child.key}-stat`);
            stat.appendChild(document.createTextNode(`${child.val().Author}: ${child.val().Title} = ${child.val().Subscribers}`));
            document.getElementById('StatsContainer').appendChild(stat);
        })
    })
}
function initializeImageUploaderView() {
    $('#FileDroperContainer').html(`
    <div class="PrevImgContainer" id="PromoContent">
        <div class="TopGradient" id="PromoContent-gradient">
            <h2>Promotional Content</h2>
            <input type="file" id="PromoContent-input" onchange="changeBGImg(this, 'PromoContent')">
            <p id="PromoContent-progress"></p>
            <div class="ClearDiv"></div>
        </div>
    </div>`);
    database.ref('PromoContent').once('value', promoContent => {
        if (promoContent.val()) {
            $(`#PromoContent`).css('background-image', `url('${promoContent.val()}')`);
            $(`#PromoContent-gradient`).append(`<button id="PromoContent-removeButton" onclick="removeImageFrom('PromoContent')">Remove Image</button>`);
        }
    });
    database.ref("SubcriptionOptions").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            $('#FileDroperContainer').append(
            `<div class="PrevImgContainer" id="${child.key}">
                <div class="TopGradient" id="${child.key}-gradient">
                    <h2>${child.val().Author}: ${child.val().Title}</h2>
                    <input type="file" id="${child.key}-input" onchange="changeBGImg(this, '${child.key}')">
                    <p id="${child.key}-progress"></p>
                    <div class="ClearDiv"></div>
                </div>
            </div>`);
            database.ref(`SubcriptionOptions/${child.key}`).once('value', function(snapshot) {
                if (Object.keys(snapshot.val()).includes("DownloadURL")) {
                    $(`#${child.key}`).css('background-image', `url('${snapshot.val()["DownloadURL"]}')`);
                    $(`#${child.key}-gradient`).append(`<button id="${child.key}-removeButton" onclick="removeImageFrom('${child.key}')">Remove Image</button>`);
                }
            });
        });
        database.ref('TanachLink').once('value', snapshot => {
            var placeholder = "Tanach Weekly Study Link";
            if (snapshot) {
                placeholder = snapshot.val();
            }
            $('#FileDroperContainer').append(
                `<div id="tanachLinkInputContainer">
                    <input type="text" placeholder="${placeholder}" id="tanachLink">
                    <button onclick="uploadTanachLink()">Upload</button>
                </div>`
            );
        });
    });
}
function uploadTanachLink() {
    if ($("#tanachLink").val() != "") {
        database.ref('TanachLink').set($("#tanachLink").val());
        setTimeout(function() {
            alert('Tanach Link Has Been Updated.');
        }, 1000);
    } else {
        alert('Tanach Link Cannot Be Empty.');
    }
}
function addRemoveImgButton(gradientID) {
    const gradient = document.getElementById(gradientID);
}

function removeImageFrom(imgID) {
    storage.ref(`PDFs/${imgID}`).delete()
    .then(function() {
        let dbPath = `SubcriptionOptions/${imgID}/DownloadURL`;
        if (imgID == "PromoContent") {
            dbPath = 'PromoContent';
        }
        database.ref(dbPath).remove().then(function() {
            $(`#${imgID}`).css('background-image', 'none');
        }).catch(function(error) {
            if (error) {
                alert(error.message);
            }
        });
    }).catch(function(error) {
        if (error) {
            alert(error.message);
        }
    });
}

function removeAllImages() {
    const imageContainers = document.getElementsByClassName('PrevImgContainer');
    Array.prototype.filter.call(imageContainers, function(imgContainer) {
        if (imgcontainer.id != "PromoContent" && $(`#${imgContainer.id}`).css('background-image') != 'none') {
            $(`#${imgContainer.id}-removeButton`).hide();
            removeImageFrom(imgContainer.id);
        }
    });
}
function uploadImageFrom(containerID) {
    const file = document.getElementById(`${containerID}-input`).files[0];
    var uploadTask = storage.ref('PDFs/').child(`${containerID}`).put(file);

    uploadTask.on('state_changed', function(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById(`${containerID}-uploadButton`).style.display = 'none';
        document.getElementById(`${containerID}-progress`).innerHTML = `(${progress}% / 100% complete.)`;
    }, function(error) {
        if (error) {
            document.getElementById(`${containerID}-gradient`).style.background = 'linear-gradient(rgb(255, 152, 152), rgba(255, 152, 152, 0.2))';
            document.getElementById(`${containerID}-progress`).innerHTML = "Upload Failed";
            alert(error.message);
        }
    }, function() {
        document.getElementById(`${containerID}-gradient`).style.background = 'linear-gradient(rgb(152, 251, 152), rgba(152, 251, 152, 0.2))';
        document.getElementById(`${containerID}-progress`).innerHTML = "Uploaded Successfully";
        $(`#${containerID}-gradient`).append(`<button id="${containerID}-removeButton" onclick="removeImageFrom('${containerID}')">Remove Image</button>`);
        let dbPath = `SubcriptionOptions/${containerID}/DownloadURL`;
        if (containerID == "PromoContent") {dbPath = containerID}
        database.ref(dbPath).set(uploadTask.snapshot.downloadURL);
    });
}

function changeBGImg(input, imgID) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $(`#${imgID}`).css('background-image', `url(${e.target.result})`);
            if (document.getElementById(`${imgID}-uploadButton`) == null) {
                $(`#${imgID}-gradient`).append(`<button id="${imgID}-uploadButton" onclick="uploadImageFrom('${imgID}')">Upload</button>`);
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}
function initiateAdd() {
    $(document.body).append(
        `<div id="NewSubscriptionPopup">
            <input type="text" id="authorInput" placeholder="Author">
            <input type="text" id="titleInput" placeholder="Title">
            <div class="CategoryInfoContainer">  
                <input type="radio" value="Other" name="Category" id="Category-Other"> Other Must Reads<br>
                <input type="radio" value="Affiliates" name="Category" id="Category-Affiliates">  SCA Affiliates
            </div>
            <button onclick="addSubscription()">Add Subscription</button>
        </div>`
    );
}
function initiateRemove() {
    const subscriptionsPanel = document.getElementById('StatsContainer').childNodes;
    subscriptionsPanel.forEach(function(subscription) {
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('onclick', `removeSubscription('${subscription.id.slice(0, -5)}-remove')`);
        subscription.appendChild(checkbox);
    })
}
function initiateReschedule() {
    const popup = document.createElement('div');
    popup.setAttribute('id', 'ReschedulePopup');

    const heading = document.createElement('h3');
    database.ref('ScheduleTime').once('value', function(snapshot) {
        const day = snapshot.val().Day;
        const hour = snapshot.val().Hour;
        const minute = snapshot.val().Minute;
        heading.appendChild(document.createTextNode(`The blast is scheduled for ${day}, at ${hour}:${minute}. Please enter the time you'd like to reschedule it for.`));
    });
    const dayInfo = document.createElement('span');
    dayInfo.appendChild(document.createTextNode("Day: "));
    const dayTF = document.createElement('input');
    dayTF.setAttribute('type', 'text');
    dayTF.setAttribute('id', 'reschedule-day');
    dayInfo.appendChild(dayTF);

    const hourInfo = document.createElement('span');
    hourInfo.appendChild(document.createTextNode('Hour: '));
    const hourTF = document.createElement('input');
    hourTF.setAttribute('type', 'text');
    hourTF.setAttribute('id', 'reschedule-hour');
    hourInfo.appendChild(hourTF);

    const minuteInfo = document.createElement('span');
    minuteInfo.appendChild(document.createTextNode("Minute: "));
    const minuteTF = document.createElement('input');
    minuteTF.setAttribute('type', 'text');
    minuteTF.setAttribute('id', 'reschedule-minute');
    minuteInfo.appendChild(minuteTF);

    const submitButton = document.createElement('button');
    submitButton.appendChild(document.createTextNode('Submit'));
    submitButton.setAttribute('onclick', 'reschedule()');

    const cancelButton = document.createElement('button');
    cancelButton.appendChild(document.createTextNode('Cancel'));
    cancelButton.setAttribute('onclick', 'cancelReschedule();');

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(submitButton);
    buttonContainer.appendChild(cancelButton);

    popup.appendChild(heading);
    popup.appendChild(dayInfo);
    popup.appendChild(hourInfo);
    popup.appendChild(minuteInfo);
    popup.appendChild(buttonContainer);

    document.body.appendChild(popup);
}
function cancelReschedule() {
    document.getElementById('ReschedulePopup').style.display = 'none';
}
function reschedule() {
    const day = document.getElementById('reschedule-day').value;
    const hour = document.getElementById('reschedule-hour').value;
    const minute = document.getElementById('reschedule-minute').value;
    const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (!validDays.includes(day)) {
        alert(`Invalid day entered.\nPlease format the day as the ones in this list:\n${validDays}`);
        return;
    }
    if (hour > 23 || hour < 0) {
        alert('Invalid hour entered.\nPlease ensure the hour value entered is a number between 0-23');
        return;
    }
    if (minute > 59 || minute < 0) {
        alert('Invalid minute value entered.\nPlease ensure the minutes value entered is a number between 0-59');
        return;
    }
    database.ref('ScheduleTime').set({
        Day: day,
        Hour: hour,
        Minute: minute
    });
    alert(`Email blast shedule updated to ${day}, ${hour}:${minute}`);
    document.getElementById('ReschedulePopup').style.display = 'none';
}
function addSubscription() {
    if (document.getElementById('authorInput').value != "" && document.getElementById('titleInput').value != "" && (document.getElementById('Category-Other').checked || document.getElementById('Category-Affiliates').checked)) {
        var category = "";
        if (document.getElementById('Category-Affiliates').checked) {
            category = "Affiliates";
        } else {
            category = "Other";
        }
        var newSub = database.ref('SubcriptionOptions').push({
            Author: document.getElementById('authorInput').value,
            Title: document.getElementById('titleInput').value,
            Category: category,
            Subscribers: 0
        });
        document.body.removeChild(document.getElementById('NewSubscriptionPopup'));
        initializeImageUploaderView();
        alert("Your new subscription has been saved.");
    } else {
        alert("Please make sure all inputs are filled out.");
    }
}
function removeSubscription(subscriptionID) {
    subscriptionID = subscriptionID.slice(0, -7);
    const desc = document.getElementById(subscriptionID).textContent;
    if (confirm(`You are about to remove ${desc} from the subscription options permanently.\nAre you sure you want to continue?`)) {
        database.ref(`SubcriptionOptions/${subscriptionID}`).remove();
        setTimeout(function() {
            initializeImageUploaderView();
            loadStats();
            alert("Option removal successful.");
        }, 1000);
    } else {
        loadStats();
    }
}
