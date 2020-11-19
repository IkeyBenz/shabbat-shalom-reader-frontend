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
    setTimeout(function () {
        initializeImageUploaderView();
        toggleStatsBar();
    }, 1000);
}

var database = firebase.database();
var storage = firebase.storage();

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        let displayName = $(`<p class="icon right" style="color:white;">${user.email}</p>`);
        $('.Header').append(`<p class="icon right" style="color:white;">${user.email}</p>`);
        updateSubscriptionsStatistics();
        setTimeout(function () {
            profileIcon.style.right = `${$(displayName).offsetWidth + 30}px`;
        }, 500)
    } else {
        window.location.replace('./Login/');
    }
});


function toggleStatsBar() {
    if (document.getElementById('StatsBar').style.display == "none") {
        loadStats();
        document.documentElement.style.setProperty('--StatsWidth', '300px');
        document.getElementById('StatsBar').style.display = "block";
    } else {
        document.documentElement.style.setProperty('--StatsWidth', '0px');
        document.getElementById('StatsBar').style.display = "none";
    }
}
async function updateSubscriptionsStatistics(users) {
    let snapshot = await database.ref('SubcriptionOptions').once('value');
    let subscriptionCount = {}
    for (let key of Object.keys(snapshot.val())) {
        subscriptionCount[key] = 0;
    }
    var users = await new Promise(function (resolve, reject) {
        var subscribers = [];
        database.ref('Users').once('value', snapshot => {
            Object.keys(snapshot.val()).forEach(function (key) {
                subscribers.push(snapshot.val()[key]);
            });
            resolve(subscribers);
        });
    });
    var userSubs = [];
    for (let user of users) {
        if (user.Subscriptions) {
            userSubs.push(user.Subscriptions);
        }
    }
    for (var i = 0; i < userSubs.length; i++) {
        Object.keys(userSubs[i]).forEach(function (subscriptionKey) {
            if (userSubs[i][subscriptionKey] && Object.keys(subscriptionCount).includes(subscriptionKey)) {
                subscriptionCount[subscriptionKey] += 1;
            }
        });
    }
    Object.keys(subscriptionCount).forEach(function (subscriptionKey) {
        database.ref(`SubcriptionOptions/${subscriptionKey}/Subscribers`).set(subscriptionCount[subscriptionKey]);
    });
    setTimeout(loadStats, 3000);
}
function loadStats() {
    database.ref("SubcriptionOptions").on("value", function (snapshot) {
        const statisticsContainer = document.getElementById('StatsContainer');
        while (statisticsContainer.lastChild) {
            statisticsContainer.removeChild(statisticsContainer.lastChild);
        }
        snapshot.forEach(function (child) {
            const stat = document.createElement('h4');
            stat.setAttribute('id', `${child.key}-stat`);
            stat.appendChild(document.createTextNode(`${child.val().Author}: ${child.val().Title} = ${child.val().Subscribers}`));
            document.getElementById('StatsContainer').appendChild(stat);
        })
    })
}
async function initializeImageUploaderView() {
    let promoHtml = getFileDropperHTML('Promotional Content', 'PromoContent');
    $('#FileDroperContainer').html(promoHtml);
    database.ref('PromoContent').once('value', promoContent => {
        if (promoContent.val()) {
            $(`#PromoContent`).css('background-image', `url('${promoContent.val()}')`);
            $(`#PromoContent-gradient`).append(`<button id="PromoContent-removeButton" onclick="removeImageFrom('PromoContent')">Remove Image</button>`);
        }
    });
    let frontCoverHtml = getFileDropperHTML('Front Cover', 'FrontCover');
    $('#FileDroperContainer').append(frontCoverHtml);
    database.ref('FrontCover').once('value', frontCover => {
        if (frontCover.val()) {
            $(`#FrontCover`).css('background-image', `url('${frontCover.val()}')`);
            $(`#FrontCover-gradient`).append(`<button id="FrontCover-removeButton" onclick="removeImageFrom('FrontCover')">Remove Image</button>`);
        }
    });
    const subscriptions = await database.ref("SubcriptionOptions").once("value").then(s => s.val())
    const sortedSubs = sortSubscriptionsByLastName(subscriptions);
    Object.entries(sortedSubs).forEach(([key, child]) => {
        let title = `${child.Author}: ${child.Title}`
        let html = getFileDropperHTML(title, key);
        $('#FileDroperContainer').append(html);
        database.ref(`SubcriptionOptions/${key}`).once('value', function (snapshot) {
            if (Object.keys(snapshot.val()).includes("DownloadURL")) {
                $(`#${key}`).css('background-image', `url('${snapshot.val()["DownloadURL"]}')`);
                $(`#${key}-gradient`).append(`<button id="${key}-removeButton" onclick="removeImageFrom('${key}')">Remove Image</button>`);
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
}

function sortSubscriptionsByLastName(subscriptions) {
    function getLastName(name) {
        const parts = name.split(' ');
        if (parts[parts.length - 1] !== 'A"H') {
            return parts[parts.length - 1];
        } else {
            return parts[parts.length - 2];
        }
    }
    return Object.fromEntries(
        Object.entries(subscriptions).sort(
            ([key1, val1], [key2, val2]) => {
                const lastName1 = getLastName(val1.Author);
                const lastName2 = getLastName(val2.Author);
                return lastName1 > lastName2;
            }
        )
    )
}
function getFileDropperHTML(title, key) {
    return `<div class="PrevImgContainer" id="${key}">
        <div class="TopGradient" id="${key}-gradient">
            <h2>${title}</h2>
            <input type="file" id="${key}-input" onchange="changeBGImg(this, '${key}')">
            <p id="${key}-progress"></p>
            <div class="ClearDiv"></div>
        </div>
    </div>`
}
function uploadTanachLink() {
    if ($("#tanachLink").val() != "") {
        database.ref('TanachLink').set($("#tanachLink").val());
        setTimeout(function () {
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
        .then(function () {
            let dbPath = `SubcriptionOptions/${imgID}/DownloadURL`;
            if (imgID == "PromoContent") {
                dbPath = 'PromoContent';
            }
            database.ref(dbPath).remove().then(function () {
                $(`#${imgID}`).css('background-image', 'none');
            }).catch(function (error) {
                if (error) {
                    alert(error.message);
                }
            });
        }).catch(function (error) {
            if (error) {
                alert(error.message);
            }
        });
}

function removeAllImages() {
    const imageContainers = document.getElementsByClassName('PrevImgContainer');
    Array.prototype.filter.call(imageContainers, function (imgContainer) {
        if (imgContainer.id != "PromoContent" && $(`#${imgContainer.id}`).css('background-image') != 'none') {
            $(`#${imgContainer.id}-removeButton`).hide();
            removeImageFrom(imgContainer.id);
        }
    });
}
function uploadImageFrom(containerID) {
    const file = document.getElementById(`${containerID}-input`).files[0];
    var uploadTask = storage.ref('PDFs/').child(`${containerID}`).put(file);

    uploadTask.on('state_changed', function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById(`${containerID}-uploadButton`).style.display = 'none';
        document.getElementById(`${containerID}-progress`).innerHTML = `(${progress}% / 100% complete.)`;
    }, function (error) {
        if (error) {
            document.getElementById(`${containerID}-gradient`).style.background = 'linear-gradient(rgb(255, 152, 152), rgba(255, 152, 152, 0.2))';
            document.getElementById(`${containerID}-progress`).innerHTML = "Upload Failed";
            alert(error.message);
        }
    }, function () {
        document.getElementById(`${containerID}-gradient`).style.background = 'linear-gradient(rgb(152, 251, 152), rgba(152, 251, 152, 0.2))';
        document.getElementById(`${containerID}-progress`).innerHTML = "Uploaded Successfully";
        $(`#${containerID}-gradient`).append(`<button id="${containerID}-removeButton" onclick="removeImageFrom('${containerID}')">Remove Image</button>`);
        let dbPath = `SubcriptionOptions/${containerID}/DownloadURL`;
        if (containerID == "PromoContent" || containerID == "FrontCover") { dbPath = containerID }
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
    subscriptionsPanel.forEach(function (subscription) {
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('onclick', `removeSubscription('${subscription.id.slice(0, -5)}-remove')`);
        subscription.appendChild(checkbox);
    })
}
async function initiateReschedule() {
    let heading = ""
    let currentTime = await database.ref('ScheduleTime').once('value');
    let val = currentTime.val();
    heading = `The blast is scheduled for ${val.Day}, at ${val.Hour}:${val.Minute}. Please enter the time you'd like to reschedule it for.`;
    let popup = `
        <div id="ReschedulePopup">
            <h3>${heading}</h3>
            <span>Day: <input type="text" id="reschedule-day"></span>
            <span>Hour: (24hr Scale) <input type="text" id="reschedule-hour"></span>
            <span>Minute: <input type="text" id="reschedule-minute"></span>
            <div>
                <button onclick="reschedule()">Submit</button>
                <button onclick="cancelReschedule()">Cancel</button>
            </div>
        </div>
    `;
    $('body').append(popup);
}
function cancelReschedule() {
    document.getElementById('ReschedulePopup').style.display = 'none';
}
function reschedule() {
    const day = $('#reschedule-day').val();
    const hour = $('#reschedule-hour').val();
    const minute = $('#reschedule-minute').val();
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
    setTimeout(alert(`Email blast shedule updated to ${day}, ${hour}:${minute}`), 1000);
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
        setTimeout(function () {
            initializeImageUploaderView();
            loadStats();
            alert("Option removal successful.");
        }, 1000);
    } else {
        loadStats();
    }
}
