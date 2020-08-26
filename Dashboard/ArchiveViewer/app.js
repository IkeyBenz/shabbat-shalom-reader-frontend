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

$(document).ready(function () {
    Archives.displayByMonth();
    $('#sortPreference').on('change', function() {
        if (this.value == 'Rabbi') {
            Archives.displayByRabbi();
        } else {
            Archives.displayByMonth();
        }
    });
});

const Archives = (function() {
    var loadedArchives;
    function load() {
        if (!loadedArchives) {
            return new Promise(async function(resolve, reject) {
                let snapshot = await database.ref('SubcriptionOptions').once('value');
                let subscriptions = snapshot.val();
                let a = {}
                for (let subKey in subscriptions) {
                    let sub = subscriptions[subKey];
                    if (sub.Archives) {
                        a[`${sub.Author}`] = sub.Archives;
                    }
                }
                loadedArchives = a;
                resolve(a);
            });
        } 
        return loadedArchives;
    }
    function organizeByMonth(archives) {
        let months = ["January", 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let archivesByMonth = {}
        for (let rabbiName in archives) {
            for (title in archives[rabbiName]) {
                const [date, parasha] = parseArchiveTitle(title);
                const [monthNum] = date.split('-');

                const month = months[monthNum - 1];
                if (!archivesByMonth[month]) {
                    archivesByMonth[month] = {}
                }
                if (!archivesByMonth[month][parasha]) {
                    archivesByMonth[month][parasha] = {}
                }
                archivesByMonth[month][parasha][rabbiName] = archives[rabbiName][title]
            }
        }
        return archivesByMonth;
    }
    function showHTMLByMonth(sortedArchives) {
        var html = "";
        for (let month in sortedArchives) {
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
        $('main').html(html);
    }
    function showHTMLByRabbi(archives) {
        let html = '';
        for (let rabbiName in archives) {
            html += `<h2>${rabbiName}:</h2>
                     <div class="archiveContainer">
                     <div class="archiveSlider">`;
            for (let title in archives[rabbiName]) {
                html += `<a class="previewContainer" href="${archives[rabbiName][title]}">
                            <img src="${archives[rabbiName][title]}">
                            <p>${title.slice(0, title.indexOf('-'))}</p>
                         </a>`;
            }
            html += '</div></div>';
        }
        $('main').html(html);
    }
    const fileFromUrl = (url) => new Promise((res, rej) => {
        JSZipUtils.getBinaryContent(url, (err, data) => {
            err ? rej(err) : res(data);
        });
    });

    function parseArchiveTitle(title) {
        const reversed = title.split('').reverse().join('');
        const [year, day, month, ...parasha] = reversed.split('-');

        const date = [
            month.split('').reverse().join(''),
            day.split('').reverse().join(''),
            year.split('').reverse().join(''),
        ].join('-').trim();

        const unreversedParasha = (
            typeof parasha === 'object'
                ? parasha.join('-').split('').reverse().join('')
                : parasha.split('').reverse().join('')
        ).trim();

        return [date, unreversedParasha];
    }

    return {
        displayByMonth: async function() {
            const a = await load();
            const organized = organizeByMonth(a);
            showHTMLByMonth(organized);
        },
        displayByRabbi: async function() {
            const a = await load();
            showHTMLByRabbi(a);
        },
        downloadAll: async function () {
            const archives = await load();
            const byMonth = organizeByMonth(archives);
            const zip = new JSZip();

            Object.entries(byMonth).forEach(([month, parashas]) => {
                Object.entries(parashas).forEach(([parasha, rabbis]) => {
                    Object.entries(rabbis).forEach(([rabbiName, fileUrl]) => {
                        zip.file(
                            `ssreader-archives/${month}/${parasha}/${rabbiName}.pdf`,
                            fileFromUrl(fileUrl),
                            { binary: true }
                        );
                    });
                })
            });
            
            return zip.generateAsync(
                { type: 'blob' },
                (metadata) => updateProgressBar(metadata.percent),
            ).then((blob) => {
                saveAs(blob, 'archives-by-rabbi.zip');
            });
        }
    }
})();

function updateProgressBar(percent) {
    $('.progress-bar')
        .attr('aria-valuenow', percent)
        .css('width', `${percent}%`)
        .text(`${percent.toFixed(2)}%`);
}

function downloadAll() {
    $('#download-btn').toggleClass('d-none');
    $('.progress').toggleClass('d-none');
    Archives.downloadAll().finally(() => {
        $('#download-btn').toggleClass('d-none');
        $('.progress').toggleClass('d-none');
    });
}