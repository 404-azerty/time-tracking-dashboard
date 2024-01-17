const main = document.querySelector("main");
const navigationItems = document.querySelectorAll("nav ul li");

const data = [];

/**
 * On écoute le changement de période
 */
navigationItems.forEach((navigationItem) => navigationItem.addEventListener("click", onChangePeriod));

/**
 * Au chargement de la page, on récupère les données du fichier json lié
 */
(() => {
  fetch("./data.json")
    .then((res) => res.json())
    .then((data) => buildStructure(data));
})();

/**
 * Les données récupées sont sous forme de tableau. Pour chaque élément, on construit le squellette html sous forme de carte.
 * On en profite aussi pour y ajouter une propriété name qui contient le titre en kebab-case et on ajoute chaque carte créée au dom dans la balise main
 * @param {[{
    "title": string,
    "timeframes": {
        "daily": {"current": number,"previous": number},
        "weekly": {"current": number,"previous": number},
        "monthly": {"current": number,"previous": number}
    }
}]} elements
 */
function buildStructure(elements) {
  elements.forEach((element) => {
    const name = element.title.toLowerCase().replaceAll(" ", "-");
    data.push({ ...element, name });

    const card = buildCard(name, element);

    main.appendChild(card);
  });
}

/**
 * Construction de la carte en respectant la structure suivante :
 * @example
 * <div id="work" class="card card-work">
 *   <div class="banner">
 *    <img src="images/icon-work.svg" alt="icon work" />
 *   </div>
 *   <div class="header-card">
 *     <h2>Work</h2>
 *     <button>
 *       <img src="images/icon-ellipsis.svg" alt="icon ellipsis" />
 *     </button>
 *   </div>
 *   <div class="times">
 *     <div class="current-time">5hrs</div>
 *     <div class="previous-time">Previous - 7hrs</div>
 *   </div>
 * </div>
 * @param {string} name 
 * @param {{
    "name": string,
    "title": string,
    "timeframes": {
        "daily": {"current": number,"previous": number},
        "weekly": {"current": number,"previous": number},
        "monthly": {"current": number,"previous": number}
    }} element
 * @returns HTMLDivElement
 */
function buildCard(name, element) {
  const card = document.createElement("div");
  card.setAttribute("id", name);
  card.classList.add("card", `card-${name}`);

  const banner = document.createElement("div");
  banner.classList.add("banner");
  card.appendChild(banner);

  const icon = document.createElement("img");
  icon.setAttribute("src", `images/icon-${name}.svg`);
  icon.setAttribute("alt", `icon ${name}`);
  banner.appendChild(icon);

  const header = document.createElement("div");
  header.classList.add("header-card");
  card.appendChild(header);

  const title = document.createElement("h2");
  title.textContent = element.title;
  header.appendChild(title);

  const button = document.createElement("button");
  header.appendChild(button);

  const imageButton = document.createElement("img");
  imageButton.setAttribute("src", "images/icon-ellipsis.svg");
  imageButton.setAttribute("alt", "icon ellipsis");
  button.appendChild(imageButton);

  const times = document.createElement("div");
  times.classList.add("times");
  card.appendChild(times);

  const currentTime = document.createElement("div");
  currentTime.classList.add("current-time");
  currentTime.textContent = writeTime(getTime(name, "daily", "current"));
  times.appendChild(currentTime);

  const previousTime = document.createElement("div");
  previousTime.classList.add("previous-time");
  previousTime.textContent = `Previous - ${writeTime(getTime(name, "daily", "previous"))}`;
  times.appendChild(previousTime);

  return card;
}

/**
 * Permet de retourner le temps au pluriel ou pas en fonction des règles anglaises
 * @param {number} time
 * @returns {string} le temps avec son pluriel si besoin
 */
function writeTime(time) {
  return time === 1 ? `${time}hr` : `${time}hrs`;
}

/**
 * On retourne le temps demandé en fonction du nom, de la période et de son type en filtrant le tableau de données.
 * @param {string} name
 * @param {string} period "daily" | "weekly" | "monthly"
 * @param {string} type "current" | "previous"
 * @returns {number} le temps
 */
function getTime(name, period = "daily" | "weekly" | "monthly", type = "current" | "previous") {
  const activity = data.find((element) => element.name === name);

  return activity.timeframes[period][type];
}

/**
 * Au changement de période demandée, on modifie la classe active du menu et on ré-écrit le contenu des cartes.
 * @param {PointerEvent} event
 */
function onChangePeriod(event) {
  changeActiveNavigation(event.target);

  changeTimes(event.target.dataset.period);
}

/**
 * Tous les élément de navigation perdent la classe active et seul l'élément sélectionné la récupère
 * @param {HTMLLIElement} element
 */
function changeActiveNavigation(element) {
  navigationItems.forEach((navigationItem) => navigationItem.classList.remove("navigation-active"));

  element.classList.add("navigation-active");
}

/**
 * En exploitant le tableau de données, les temps inidqus sont ré-écrits
 * @param {string} period  "daily" | "weekly" | "monthly"
 */
function changeTimes(period) {
  data.forEach((element) => {
    const currentTime = document.querySelector(`#${element.name} .current-time`);
    currentTime.textContent = writeTime(getTime(element.name, period, "current"));

    const previousTime = document.querySelector(`#${element.name} .previous-time`);
    previousTime.textContent = writeTime(getTime(element.name, period, "previous"));
  });
}
