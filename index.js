var BASE_URL  = "https://www.freetogame.com/api/games";

var PROXY_ONE = "https://corsproxy.io/?" + BASE_URL;
var PROXY_TWO = "https://api.allorigins.win/raw?url=" + encodeURIComponent(BASE_URL);

var fallbackGames = [
  { id:1, title:"Apex Legends",      thumbnail:"https://www.freetogame.com/g/23/thumbnail.jpg",  short_description:"A fast-paced battle royale game with team-based heroes.",             genre:"Shooter",      platform:"PC", release_date:"2019-02-04", game_url:"https://www.freetogame.com/open/apex-legends" },
  { id:2, title:"Dauntless",         thumbnail:"https://www.freetogame.com/g/1/thumbnail.jpg",   short_description:"A cooperative action RPG where players hunt massive creatures.",      genre:"MMORPG",       platform:"PC", release_date:"2019-05-21", game_url:"https://www.freetogame.com/open/dauntless" },
  { id:3, title:"Fortnite",          thumbnail:"https://www.freetogame.com/g/57/thumbnail.jpg",  short_description:"A popular survival and battle royale game with building mechanics.", genre:"Battle Royale", platform:"PC", release_date:"2017-07-21", game_url:"https://www.freetogame.com/open/fortnite" },
  { id:4, title:"Genshin Impact",    thumbnail:"https://www.freetogame.com/g/475/thumbnail.jpg", short_description:"An open-world action RPG with exploration and character collecting.", genre:"Action RPG",   platform:"PC", release_date:"2020-09-28", game_url:"https://www.freetogame.com/open/genshin-impact" },
  { id:5, title:"League of Legends", thumbnail:"https://www.freetogame.com/g/286/thumbnail.jpg", short_description:"A competitive MOBA game with strategic team combat.",                genre:"MOBA",         platform:"PC", release_date:"2009-10-27", game_url:"https://www.freetogame.com/open/league-of-legends" },
  { id:6, title:"Overwatch 2",       thumbnail:"https://www.freetogame.com/g/540/thumbnail.jpg", short_description:"A team-based hero shooter focused on objectives and coordination.",  genre:"Shooter",      platform:"PC", release_date:"2022-10-04", game_url:"https://www.freetogame.com/open/overwatch-2" },
  { id:7, title:"Path of Exile",     thumbnail:"https://www.freetogame.com/g/400/thumbnail.jpg", short_description:"A dark fantasy action RPG with deep character customization.",      genre:"Action RPG",   platform:"PC", release_date:"2013-10-23", game_url:"https://www.freetogame.com/open/path-of-exile" },
  { id:8, title:"Rocket League",     thumbnail:"https://www.freetogame.com/g/474/thumbnail.jpg", short_description:"A high-energy sports game where players use cars to play soccer.",  genre:"Sports",       platform:"PC", release_date:"2020-09-23", game_url:"https://www.freetogame.com/open/rocket-league" }
];

var gameGrid      = document.getElementById("gameGrid");
var sortSelect    = document.getElementById("sortSelect");
var searchInput   = document.getElementById("searchInput");
var statusMessage = document.getElementById("statusMessage");
var games         = [];
var nextId        = fallbackGames.length + 1;

function normalizeGame(game) {
  return {
    id:                game.id                || nextId++,
    title:             game.title             || "Untitled Game",
    thumbnail:         game.thumbnail         || "",
    short_description: game.short_description || "No description available.",
    genre:             game.genre             || "Unknown Genre",
    platform:          game.platform          || "Unknown Platform",
    release_date:      game.release_date      || "2000-01-01",
    game_url:          game.game_url          || "#"
  };
}

async function tryFetch(url) {
  var response = await fetch(url);
  if (!response.ok) throw new Error("Status " + response.status);
  var data = await response.json();
  if (!Array.isArray(data)) throw new Error("Response was not a game list.");
  return data;
}

async function fetchGames() {
  statusMessage.textContent = "Loading games...";
  try {
    var data = await tryFetch(PROXY_ONE);
    games = data.slice(0, 24).map(normalizeGame);
    statusMessage.textContent = "Showing " + games.length + " live games from the FreeToGame API.";
  } catch (errorOne) {
    console.warn("Proxy 1 failed (" + errorOne.message + "), trying backup...");
    try {
      var data = await tryFetch(PROXY_TWO);
      games = data.slice(0, 24).map(normalizeGame);
      statusMessage.textContent = "Showing " + games.length + " live games from the FreeToGame API.";
    } catch (errorTwo) {
      console.warn("Proxy 2 failed (" + errorTwo.message + "), using sample games.");
      games = fallbackGames.map(normalizeGame);
      statusMessage.textContent = "Showing " + games.length + " sample games (live API unavailable).";
    }
  }
  sortAndRender();
}

function createFallbackImage(title) {
  var div = document.createElement("div");
  div.className = "game-image";
  div.setAttribute("role", "img");
  div.setAttribute("aria-label", title + " cover placeholder");
  div.textContent = title;
  return div;
}

function renderGames(gameList) {
  gameGrid.innerHTML = "";
  gameList.forEach(function (game) {
    var card = document.createElement("article");
    card.className = "game-card";

    if (game.thumbnail) {
      var image     = document.createElement("img");
      image.src     = game.thumbnail;
      image.alt     = game.title + " cover image";
      image.width   = 460;
      image.height  = 215;
      image.loading = "lazy";
      image.onerror = function () { image.replaceWith(createFallbackImage(game.title)); };
      card.appendChild(image);
    } else {
      card.appendChild(createFallbackImage(game.title));
    }

    var content             = document.createElement("div");
    content.className       = "game-content";
    var titleEl             = document.createElement("h2");
    titleEl.textContent     = game.title;
    var date                = document.createElement("p");
    date.className          = "game-date";
    date.textContent        = "Released: " + formatDate(game.release_date);
    var description         = document.createElement("p");
    description.className   = "game-description";
    description.textContent = game.short_description;
    var meta                = document.createElement("div");
    meta.className          = "game-meta";
    var genre               = document.createElement("span");
    genre.className         = "pill";
    genre.textContent       = game.genre;
    var platform            = document.createElement("span");
    platform.className      = "pill";
    platform.textContent    = game.platform;
    var link                = document.createElement("a");
    link.className          = "game-link";
    link.href               = game.game_url;
    link.target             = "_blank";
    link.rel                = "noopener noreferrer";
    link.textContent        = "View Game";

    meta.appendChild(genre);
    meta.appendChild(platform);
    content.appendChild(titleEl);
    content.appendChild(date);
    content.appendChild(description);
    content.appendChild(meta);
    content.appendChild(link);
    card.appendChild(content);
    gameGrid.appendChild(card);
  });
}

function getFilteredGames(gameList, keyword) {
  if (!keyword) return gameList;
  var term = keyword.toLowerCase();
  return gameList.filter(function (game) {
    return (
      game.title.toLowerCase().includes(term) ||
      game.genre.toLowerCase().includes(term) ||
      game.platform.toLowerCase().includes(term) ||
      game.short_description.toLowerCase().includes(term)
    );
  });
}

function getSortedGames(gameList, sortType) {
  var sorted = gameList.slice();
  if (sortType === "az")     return sorted.sort(function (a, b) { return a.title.localeCompare(b.title); });
  if (sortType === "za")     return sorted.sort(function (a, b) { return b.title.localeCompare(a.title); });
  if (sortType === "newest") return sorted.sort(function (a, b) { return new Date(b.release_date) - new Date(a.release_date); });
  if (sortType === "oldest") return sorted.sort(function (a, b) { return new Date(a.release_date) - new Date(b.release_date); });
  return sorted;
}

function sortAndRender() {
  var keyword  = searchInput.value.trim();
  var sortType = sortSelect.value;
  var filtered = getFilteredGames(games, keyword);
  var sorted   = getSortedGames(filtered, sortType);
  if (sorted.length === 0 && keyword) {
    gameGrid.innerHTML = "<p class=\"no-results\">No games found for \"" + keyword + "\". Try a different search.</p>";
  } else {
    renderGames(sorted);
  }
}

function formatDate(dateString) {
  var date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown release date";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

sortSelect.addEventListener("change", sortAndRender);
searchInput.addEventListener("input", sortAndRender);

fetchGames();
