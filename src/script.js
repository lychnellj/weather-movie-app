import { getCurrentLocation, showPosition, getCoordinates, getWeather, renderWeatherTable } from "./weatherCoords.js";
import { displayMovie, mayThe4Th, findRandomMovies } from "./movieFinder.js";
/* ====================== DROPDOWN FÖR STADSSÖKNING (+ knapp) ====================== */

let cities = [];

function cleanCityList(cities) {
	return (
		cities
			// Går igenom varje stad i listan
			.filter(function (name) {
				const lower = name.toLowerCase();

				// Tar bort städer som innehåller "kommun"
				if (lower.indexOf("kommun") !== -1) {
					// "!== -1" = "om vi hittade ordet 'kommun'"
					return false;
				}

				// Tar bort städer som innehåller "ae" eller "oe"
				if (lower.indexOf("ae") !== -1 || lower.indexOf("oe") !== -1) {
					return false;
				}

				// Annars behåll namnet
				return true;
			})
	);
}

(function () {
	// IIFE så att koden körs direkt utan att behöva kallas
	function loadSwedenCities() {
		// API-anropet
		fetch("https://countriesnow.space/api/v0.1/countries/cities", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ country: "Sweden" })
		})
			.then(function (res) {
				return res.json();
			}) // Omvandlar res till json
			// Kollar om json.data är en Array, om det är en lista kör cleanCityList()
			.then(function (json) {
				if (json && Array.isArray(json.data)) {
					cities = cleanCityList(json.data);
				} else {
					console.error("Oväntat API-svar:", json);
				}
			});
	}
	// Kör loadSwedenCities endast när sidan är färdigladdad
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", loadSwedenCities);
	} else {
		loadSwedenCities();
	}
})();

const cityInput = document.querySelector(".cityInput");
const dropdown = document.querySelector(".dropdown");
const fetchBtn = document.querySelector(".fetchBtn");

cityInput.addEventListener("input", function () {
	const query = this.value.toLowerCase(); // Gör sök okänslig till versaler och gemener
	dropdown.innerHTML = ""; // Rensar tidigare resultat

	// Om fältet är tomt, göm dropdown och avbryt
	if (query.length === 0) {
		dropdown.style.display = "none";
		return;
	}

	// Jämför stads-alternativ med användarens sök i gemener
	const filteredCities = cities.filter(function (city) {
		return city.toLowerCase().indexOf(query) === 0;
	});

	// Om inga träffer, göm dropdown och avbryt
	if (filteredCities.length === 0) {
		dropdown.style.display = "none";
		return;
	}

	// Loopar igenom matchande städer och skapar ett nytt li för varje stad och sätter texten
	for (let i = 0; i < filteredCities.length; i++) {
		const li = document.createElement("li");
		li.textContent = filteredCities[i];

		// När man klickar på ett förslag så fylls input med stadens namn och gömmer dropdown
		li.addEventListener("click", async function () {
			cityInput.value = this.textContent;
			dropdown.style.display = "none";
		});

		// Lägger till <li> i dropdownlistan
		dropdown.appendChild(li);
	}

	// Gör dropdownen synlig efter att ha fyllt den med li
	dropdown.style.display = "block";
});

// Stänger dropdown om man klickar utanför
document.addEventListener("click", function (e) {
	if (!e.target.closest(".search-container")) {
		dropdown.style.display = "none";
	}
});

// Hämta plats knapp FUNKTION

fetchBtn.addEventListener("click", async function () {
	const city = cityInput.value;

	// Om ingen stad vald avbryt
	if (!city) {
		console.log("Ingen stad vald.");
		return;
	}
	const result = await getCoordinates(city);

	if (result) {
		console.log("Stadens position:", result.latitude, result.longitude);

		const forecast = await getWeather(result.latitude, result.longitude);

		const weatherBox = document.querySelector(".weatherBox");
		weatherBox.style.display = "block";
		renderWeatherTable(forecast);

		forecast.forEach((entry) => {
			console.log(`Tid: ${entry.time}, Temp: ${entry.temperature}°C, Nederbörd: ${entry.rainAndSnow} mm, Vind: ${entry.windSpeed} m/s`);
		});
	} else {
		console.log("Ingen träff");
	}
});

/* ====================== SLUT PÅ DROPDOWN (+ knapp + väderrender) ====================== */

document.addEventListener("DOMContentLoaded", function () {
	getCurrentLocation();
});

/* ====================== FUNKTION FÖR POSTER (+ info) ====================== */
// Testning
const mockMovies = [
  {
  Title: "Inception",
  Year: "2010",
  Genre: "Action, Adventure, Sci-Fi",
  Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  imdbID: "tt1375666"
  },
  {
  Title: "It",
  Year: "2017",
  Genre: "Horror",
  Poster: "https://m.media-amazon.com/images/M/MV5BZGZmOTZjNzUtOTE4OS00OGM3LWJiNGEtZjk4Yzg2M2Q1YzYxXkEyXkFqcGc@._V1_SX300.jpg",
  imdbID: "tt1396484"
  }
];

displayMovies(mockMovies);
//---

function displayMovies(movies) {
  const container = document.querySelector(".moviesContainer");
  container.innerHTML = "";

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];

    // Skapar en div för varje film
    const movieCard = document.createElement("div");
    movieCard.className = "classMovieCard";

    // Lägger till filmens poster
    const poster = document.createElement("img");
    poster.src = movie.Poster;
    poster.alt = movie.Title + " poster";
    poster.style.width = "200px";

    // Lägger till filmens titel + år
    const title = document.createElement("h2");
    title.textContent = movie.Title + ` (${movie.Year})`;

    // Lägger till filmens genre
    const genre = document.createElement("h3");
    genre.textContent = movie.Genre;

    // // Lägger till allt i filmkortet
    movieCard.appendChild(poster);
    movieCard.appendChild(title);
    movieCard.appendChild(genre);

    // Lägger till filmkortet i container
    container.appendChild(movieCard);
  }
}