// hämtar browserns geodata (om tillgänglig)
function getCurrentLocation() {
	console.log("fetching location...");
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	} else {
		getCoordinates();
	}
}
// lagrar position och hämtar väderinfo om browserns geodata är tillgänglig
const weatherBox = document.querySelector(".weatherBox");

async function showPosition(position) {
	const latitude = position.coords.latitude;
	const longitude = position.coords.longitude;

	console.log("Din position:", latitude, longitude);

	const forecast = await getWeather(latitude, longitude);

	weatherBox.style.display = "block";
	renderWeatherTable(forecast);

	forecast.forEach((entry) => {
		console.log(`Tid: ${entry.time}, Temp: ${entry.temperature}°C, Nederbörd: ${entry.rainAndSnow} mm, Vind: ${entry.windSpeed} m/s`);
	});
}

// visar felmeddelande vid brist av geodata
function showError(error) {
	console.log("Geolocation error:", error.message);
	//todo skapa html-element som visar att man inte har geolocation på/tillåtet
}

// callar openstreetmaps API
async function getCoordinates(city) {
	const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
	const fetchCoords = await fetch(url);
	const coordData = await fetchCoords.json();

	// kollar efter resultat på sökning av stad, och returnerar första objektets lon och lat, därav length > 0
	if (coordData.length > 0) {
		const latitude = coordData[0].lat;
		const longitude = coordData[0].lon;
		// console.log(`Latitude: ${latitude}, Longtitude: ${longitude}`); Kommenterade ut denna rad pga dublett av koordinater när jag använder fetchBtn
		return { latitude, longitude };
	} else {
		console.log("no results");
		return null;
	}
}

/* ====================== COORDS TO FORECAST ====================== */

async function getWeather(latitude, longitude) {
	const hourlyVars = ["temperature_2m", "precipitation", "wind_speed_10m"];
	const date = new Date();

	const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${hourlyVars.join(",")}&timezone=auto`;
	const fetchWeather = await fetch(weatherUrl);
	const weatherData = await fetchWeather.json();

	const timesArray = weatherData.hourly.time;

	const startIndex = timesArray.findIndex((t) => new Date(t) >= date);

	const times = timesArray.slice(startIndex - 1, startIndex + 1);
	const temps = weatherData.hourly.temperature_2m.slice(startIndex - 1, startIndex + 1);
	const precipitation = weatherData.hourly.precipitation.slice(startIndex - 1, startIndex + 1);
	const wind = weatherData.hourly.wind_speed_10m.slice(startIndex - 1, startIndex + 1); // fullösning för tidzoner, se över sen? Förlåt Jenni
	//placerar respons i objects
	const forecast = times.map((time, i) => ({
		time,
		temperature: temps[i],
		rainAndSnow: precipitation[i],
		windSpeed: wind[i]
	}));
	console.log("Kommande 2 timmarnas väderprognos: ", forecast);
	return forecast;
}

/* ====================== DROPDOWN FÖR STADSSÖKNING (+ knapp) ====================== */

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

/* ====================== Rendera väderdata till HTML ====================== */

const tableWeatherData = document.querySelector(".tableWeatherData");

function renderWeatherTable(forecast) {
	tableWeatherData.innerHTML = ""; //rensa tidigare väderdata

	forecast.forEach((entry) => {
		const rowHtml = `
      <tr>
      <td>${entry.time.slice(11, 16)}</td>
      <td>${entry.temperature}°C</td>
      <td>${entry.rainAndSnow} mm</td>
      <td>${entry.windSpeed} m/s</td>
      </tr>
      `;
		tableWeatherData.innerHTML += rowHtml;
	});
}

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
