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

function loadArchives() {
    return new Promise(async function(resolve, reject) {
        let snapshot = await database.ref('SubcriptionOptions').once('value');
        let subscriptions = snapshot.val();
        let archives = {}
        for (let subKey in subscriptions) {
            let sub = subscriptions[subKey];
            if (sub.Archives) {
                archives[`${sub.Author}`] = sub.Archives;
            }
        }
        resolve(organizeArchives(archives));
    });
}
async function organizeArchives(archives) {
    let months = ["January", 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let archivesByMonth = {}
    for (let rabbiName in archives) {
        for (title in archives[rabbiName]) {
            let info = title.split('-');
            let month = months[info[1] - 1];
            let parasha = info[0];
            if (!archivesByMonth[month]) {
                archivesByMonth[month] = {}
            }
            if (!archivesByMonth[month][parasha]) {
                archivesByMonth[month][parasha] = {}
            }
            archivesByMonth[month][parasha][rabbiName] = archives[rabbiName][title]
        }
    }
    return archivesByMonth
}
function displayArchives(sortedArchives) {
    var html = "";
    console.log(sortedArchives);
    for (let month in sortedArchives) {
        console.log(month);
        html += `<h2>${month}:</h2>`;
        for (let parasha in sortedArchives[month]) {
            html += `
                <div class="archiveContainer">
                    <h3>Parashat ${parasha}:</h3>
                    <div class="archiveSlider">`;
            for (let rabbi in sortedArchives[month][parasha]) {
                html += `
                    <a class="previewContainer" href="${sortedArchives[month][parasha][rabbi]}">
                        <img src="${sortedArchives[month][parasha][rabbi]}">
                        <p>${rabbi}</p>
                    </a>`;
            }
            html += '</div></div>';    
        }
    }
    $('main').append(html);
    console.log(html);
}

async function main() {
    let archives = await loadArchives();
    displayArchives(archives);
    console.log('This happend')
}
$(document).ready(main)