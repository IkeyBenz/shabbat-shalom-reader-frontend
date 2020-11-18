const config = {
    apiKey: "AIzaSyAFYRr1vyPOAx1DU7AMziYGObpZsO1KJkE",
    authDomain: "sca-subscriptions.firebaseapp.com",
    databaseURL: "https://sca-subscriptions.firebaseio.com",
    projectId: "sca-subscriptions",
    storageBucket: "sca-subscriptions.appspot.com",
    messagingSenderId: "1082275540488"
};
firebase.initializeApp(config);
const database = firebase.database();

function loadArchives() {
  return database.ref('NewArchives').once('value').then(s => s.val());
}
function drawUI(archives) {
  let html = '<ul class="list-group">';
  Object.entries(archives).forEach(([parasha, archives]) => {
    const key = parasha.replace(/(\s|\')/g, ''); // remove spaces and apostrophes
    html += `
      <li class="list-group-item">
         <a data-toggle="collapse" href="#${key}" role="button" aria-expanded="false"
          aria-controls="${key}">
          <h4>Parashat ${parasha}</h4>
        </a>
        <div class="collapse" id="${key}">
          <ul>
          ${Object.entries(sortByYear(archives)).map(([author, link]) => (`
            <li>
              <a href="${link}" style="text-decoration: underline" target="_blank">${author}</a>
            </li>
          `)).join('')}
          </ul>
        </div>
      </li>
    `;
  });
  html += '</ul>';
  $('main').html(html);
}

function sortByYear(parashasArchives) {
  return Object.fromEntries(
    Object.entries(parashasArchives).sort(
      ([title1], [title2]) => {
        const year1 = title1.split('_').slice(-1);
        const year2 = title2.split('_').slice(-1);
        return Number(year1) > Number(year2);
      }
    )
  )
}


$(document).ready(() => {
  loadArchives().then(drawUI);
});