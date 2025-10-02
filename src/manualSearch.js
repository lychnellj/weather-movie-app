import { getCoordinates, getWeather, renderWeatherTable } from "./weatherCoords.js";
export { cleanCityList, loadSwedenCities };

const DEVELOPMENT = false; // development flag, sätt till true för att testa
let cities = [];

const dummyCities = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås"];
const dummyCoords = { latitude: 59.3293, longitude: 18.0686 }; // stockholms koordinater

function cleanCityList(cities) {
	return (
		cities
			// går igenom varje stad i listan
			.filter(function (name) {
				const lower = name.toLowerCase();

				// tar bort städer som innehåller "kommun"
				if (lower.indexOf("kommun") !== -1) {
					// "!== -1" = "om vi hittade ordet 'kommun'"
					return false;
				}

				// tar bort städer som innehåller "ae" eller "oe"
				if (lower.indexOf("ae") !== -1 || lower.indexOf("oe") !== -1) {
					return false;
				}

				// annars behåll namnet
				return true;
			})
	);
}

// hämtar städer
async function loadSwedenCities() {
	// kollar om det är testläge
	if (DEVELOPMENT) {
		cities = cleanCityList(dummyCities);
		return cities;
	}
	try {
		const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ country: "Sweden" })
		});
		const json = await res.json();
		if (json && Array.isArray(json.data)) {
			cities = cleanCityList(json.data);
			return cities;
		} else {
			throw new Error("Oväntat API-svar: " + JSON.stringify(json));
		}
	} catch (error) {
		console.error("Fel vid hämtning av städer:", error);
		cities = cleanCityList(dummyCities);
		return cities;
	}
}

const cityInput = document.querySelector(".cityInput");
const dropdown = document.querySelector(".dropdown");
const fetchBtn = document.querySelector(".fetchBtn");

let currentIndex = -1;

cityInput.addEventListener("input", function () {
	const query = this.value.toLowerCase(); // gör sök okänslig till versaler och gemener
	dropdown.innerHTML = ""; // rensar tidigare resultat
	currentIndex = -1;

	// om fältet är tomt, göm dropdown och avbryt
	if (query.length === 0) {
		dropdown.style.display = "none";
		return;
	}

	// jämför stads-alternativ med användarens sök i gemener
	const filteredCities = cities.filter(function (city) {
		return city.toLowerCase().indexOf(query) === 0;
	});

	// om inga träffer, göm dropdown och avbryt
	if (filteredCities.length === 0) {
		dropdown.style.display = "none";
		return;
	}

	// loopar igenom matchande städer och skapar ett nytt li för varje stad och sätter texten
	for (let i = 0; i < filteredCities.length; i++) {
		const li = document.createElement("li");
		li.textContent = filteredCities[i];

		li.addEventListener("mouseenter", function () {
			currentIndex = i;
			updateHighlight(dropdown.querySelectorAll("li"));
		});

		// när man klickar på ett förslag så fylls input med stadens namn och gömmer dropdown
		li.addEventListener("click", async function () {
			cityInput.value = this.textContent;
			dropdown.style.display = "none";
			// locationLabel.textContent = "📍 " + this.textContent;
			//cityInput.value = "";
		});

		// lägger till <li> i dropdownlistan
		dropdown.appendChild(li);
	}

	// gör dropdownen synlig efter att ha fyllt den med li
	dropdown.style.display = "block";
});

// stänger dropdown om man klickar utanför
document.addEventListener("click", function (e) {
	if (!e.target.closest(".searchContainer")) {
		dropdown.style.display = "none";
	}
});

function updateHighlight(items) {
	for (let i = 0; i < items.length; i++) {
		items[i].classList.remove("highlight");
	}
	if (currentIndex > -1 && items[currentIndex]) {
		items[currentIndex].classList.add("highlight");
	}
}

cityInput.addEventListener("keydown", function (e) {
	const items = dropdown.querySelectorAll("li");

	if (e.key === "ArrowDown" && items.length) {
		e.preventDefault();
		currentIndex = (currentIndex + 1) % items.length;
		updateHighlight(items);
	} else if (e.key === "ArrowUp" && items.length) {
		e.preventDefault();
		currentIndex = (currentIndex - 1 + items.length) % items.length;
		updateHighlight(items);
	} else if (e.key === "Enter") {
		e.preventDefault();
		if (currentIndex > -1 && items[currentIndex]) {
			cityInput.value = items[currentIndex].textContent;
			dropdown.style.display = "none";
			currentIndex = -1;
		} else {
			fetchBtn.click();
		}
	}
});

// stänger dropdown om man trycker på esc
document.addEventListener("keydown", function (e) {
	if (e.key === "Escape") {
		dropdown.style.display = "none";
	}
});

const locationLabel = document.querySelector(".locationLabel");
const locationError = document.querySelector(".locationError");

let lastCity = "";

// hämta plats knapp FUNKTION
fetchBtn.addEventListener("click", async function () {
	const city = cityInput.value || lastCity;

	// om ingen stad vald avbryt
	if (!city) {
		//console.log("Ingen stad vald.");
		locationError.innerHTML = `<span class="error">Ingen stad vald.</span>`;
		return;
	}
	lastCity = city;
	locationLabel.textContent = "📍 " + city;

	const result = await getCoordinates(city);

	if (result) {
		console.log("Stadens position:", result.latitude, result.longitude);

		const forecast = await getWeather(result.latitude, result.longitude);

		const weatherBox = document.querySelector(".weatherBox");
		weatherBox.style.display = "block";
		// renderWeatherStatus(forecast);
		renderWeatherTable(forecast);

		forecast.forEach((entry) => {
			console.log(`Tid: ${entry.time}, Temp: ${entry.temperature}°C, Nederbörd: ${entry.rainAndSnow} mm, Vind: ${entry.windSpeed} m/s`);
		});
	} else {
		console.log("Ingen träff");
	}
	cityInput.value = "";
	locationError.innerHTML = "";
});
