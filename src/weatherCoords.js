import { displayMovie, mayThe4Th, findRandomMovies } from "./movieFinder.js";
export { getCurrentLocation, showPosition, getCoordinates, getWeather, renderWeatherTable, renderWeatherStatus, getCityNameFromCoords };
// hämtar browserns geodata (om tillgänglig)
function getCurrentLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	} else {
		getCoordinates();
	}
}
// lagrar position och hämtar väderinfo om browserns geodata är tillgänglig
const weatherBox = document.querySelector(".weatherBox");
const locationError = document.querySelector(".locationError");

async function showPosition(position) {
	const latitude = position.coords.latitude;
	const longitude = position.coords.longitude;

	// hämta stadsnamnet och visa det
	const cityName = await getCityNameFromCoords(latitude, longitude);
	const locationLabel = document.querySelector(".locationLabel");
	locationLabel.textContent = `📍 ${cityName}`;

	const forecast = await getWeather(latitude, longitude);

	weatherBox.style.display = "block";
	renderWeatherTable(forecast);
	renderWeatherStatus(forecast);
}

// visar felmeddelande vid brist av geodata
function showError(error) {
	let message;
	if (error.code === 1) {
		message = "Du har nekat åtkomst till platsdata, skriv in din plats manuellt i sökfältet.";
	} else if (error.code === 2) {
		message = "Platsdata kunde inte hämtas.";
	} else if (error.code === 3) {
		message = "Tidsgräns för platsdata överskreds.";
	} else if (error.code === 4) {
		message = "Okänt fel med platsdata.";
	}
	showApiError(message);
}
// skapar en span med felmeddelandet vid fel
function showApiError(message) {
	locationError.style.display = "block";
	locationError.innerHTML = `<span class="error">${message}</span>`;
}

// callar openstreetmaps API, lagt i en try-catch ifall något går fel
async function getCoordinates(city) {
	try {
		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
		const fetchCoords = await fetch(url);

		if (!fetchCoords.ok) {
			throw new Error(`OpenStreetMap API error: ${fetchCoords.status}`);
		}
		const coordData = await fetchCoords.json();

		// kollar efter resultat på sökning av stad, och returnerar första objektets lon och lat, därav length > 0
		if (coordData.length > 0) {
			const latitude = coordData[0].lat;
			const longitude = coordData[0].lon;
			return { latitude, longitude };
		} else {
			console.log("no results");
			return null;
		}
	} catch (error) {
		console.error("Fel vid hämtning av koordinater:", error);
		showApiError("Kunde inte hämta koordinater för platsen, tjänsten är nere. Försök senare.");
		return null;
	}
}

// gör om koordinater till stad
async function getCityNameFromCoords(latitude, longitude) {
	try {
		const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
		const cityResponse = await fetch(url);
		if (!cityResponse.ok) throw new Error("Reverse geocoding failed");
		const cityData = await cityResponse.json();
		// försöker visa stad
		return cityData.address.city || cityData.address.town || cityData.address.village || "Okänd plats";
	} catch (error) {
		console.error("Kunde inte hämta stadsnamn:", error);
		return "Okänd plats";
	}
}

//deklarerar väderkoder
const wCodesMap = new Map([
	[0, "Soligt/Klart"],
	[1, "Mestadels klart"],
	[2, "Delvis molnigt"],
	[3, "Mulet"],
	[45, "Dimma"],
	[48, "Rimfrostdimma"],
	[51, "Svagt duggregn"],
	[53, "Måttligt duggregn"],
	[55, "Kraftigt duggregn"],
	[56, "Svagt underkylt duggregn"],
	[57, "Kraftigt underkylt duggregn"],
	[61, "Lätt regn"],
	[63, "Måttligt regn"],
	[65, "Kraftigt regn"],
	[66, "Lätt underkylt regn"],
	[67, "Kraftigt underkylt regn"],
	[71, "Lätt snöfall"],
	[73, "Måttligt snöfall"],
	[75, "Kraftigt snöfall"],
	[77, "Kornsnö"],
	[80, "Lätt regnskur"],
	[81, "Måttlig regnskur"],
	[82, "Kraftig regnskur"],
	[85, "Lätta snöbyar"],
	[86, "Kraftiga snöbyar"],
	[95, "Åska"],
	[96, "Åska med milt hagel"],
	[99, "Åska med kraftigt hagel"]
]);

// mappar väderkoder till gifar
const wCodesGif = new Map([
	[0, "weather1.gif"],
	[1, "weather2.gif"],
	[2, "weather2.gif"],
	[3, "weather3.gif"],
	[45, "weather3.gif"],
	[48, "weather3.gif"],
	[51, "weather4.gif"],
	[53, "weather4.gif"],
	[55, "weather4.gif"],
	[56, "weather4.gif"],
	[57, "weather4.gif"],
	[61, "weather4.gif"],
	[63, "weather5.gif"],
	[65, "weather5.gif"],
	[66, "weather5.gif"],
	[67, "weather5.gif"],
	[71, "weather6.gif"],
	[73, "weather6.gif"],
	[75, "weather6.gif"],
	[77, "weather6.gif"],
	[80, "weather4.gif"],
	[81, "weather5.gif"],
	[82, "weather5.gif"],
	[85, "weather6.gif"],
	[86, "weather6.gif"],
	[95, "weather7.gif"],
	[96, "weather7.gif"],
	[99, "weather7.gif"]
]);


// gör om koordinater till en prognos
async function getWeather(latitude, longitude) {
	try {
		const hourlyVars = ["temperature_2m", "precipitation", "wind_speed_10m", "weathercode"];
		const date = new Date();

		const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${hourlyVars.join(",")}&timezone=auto`;
		const fetchWeather = await fetch(weatherUrl);

		if (!fetchWeather.ok) {
			throw new Error(`Weather API error: ${fetchWeather.status}`);
		}

		const weatherData = await fetchWeather.json();

		const timesArray = weatherData.hourly.time;

		const startIndex = timesArray.findIndex((t) => new Date(t) >= date);

		const times = timesArray.slice(startIndex - 1, startIndex + 1);
		const temps = weatherData.hourly.temperature_2m.slice(startIndex - 1, startIndex + 1);
		const precipitation = weatherData.hourly.precipitation.slice(startIndex - 1, startIndex + 1);
		const wind = weatherData.hourly.wind_speed_10m.slice(startIndex - 1, startIndex + 1); // fullösning för tidzoner, se över sen? Förlåt Jenni
		const wCodes = weatherData.hourly.weathercode.slice(startIndex - 1, startIndex + 1);
		//placerar respons i objects
		const forecast = times.map((time, i) => ({
			time,
			temperature: temps[i],
			rainAndSnow: precipitation[i],
			windSpeed: wind[i],
			weatherCodes: wCodes[i]
		}));
		return forecast;
	} catch (error) {
		console.error("Fel vid hämtning av väder:", error);
		showApiError("Kunde inte hämta koordinater för platsen.");
		return [];
	}
}
// Säger till om det är bra väder
const goodBadWeatherBox = document.querySelector(".goodBadWeather");

function renderWeatherStatus(forecast) {
	var wCodes = forecast[0].weatherCodes;
	var wCodesTwo = forecast[1].weatherCodes;

	//mappar gifar till väderkoder
	const gifFile1 = wCodesGif.get(wCodes) || "default.gif";
	const gifFile2 = wCodesGif.get(wCodesTwo) || "default.gif";
	const img1 = document.createElement("img");
	const img2 = document.createElement("img");

	img1.src = `src/images/${gifFile1}`;
	img1.alt = `Väder gif`;


	img2.src = `src/images/${gifFile2}`;
	img2.alt = `Väder gif`;

	goodBadWeatherBox.innerHTML = "";
	if (wCodes > 1 || wCodesTwo > 1) {
		goodBadWeatherBox.innerHTML = `<p>Pissigt väder, kolla film >:(</p>`;
		goodBadWeatherBox.appendChild(img1);
		goodBadWeatherBox.appendChild(img2);
		findRandomMovies();
	} else {
		goodBadWeatherBox.innerHTML = `<p>Touch grass noob</p>`;
		goodBadWeatherBox.appendChild(img1);
		goodBadWeatherBox.appendChild(img2);
		const container = document.querySelector(".moviesContainer");
		container.innerHTML = ""; // rensar filmer ifall man haft dåligt väder först
	}
}

/* ====================== Rendera väderdata till HTML ====================== */
const tableWeatherData = document.querySelector(".tableWeatherData");

function renderWeatherTable(forecast) {
	tableWeatherData.innerHTML = ""; //rensa tidigare väderdata

	forecast.forEach((entry) => {
		const rowHtml = `
	  <tr class="timeWeather">
	  <td>${entry.time.slice(11, 16)}</td>
	  <td>${wCodesMap.get(entry.weatherCodes)}</td>
	  </tr>
	  <tr class="timeWeatherParams">
	  <td>${entry.temperature}°C</td>
	  <td>${entry.rainAndSnow} mm</td>
	  <td>${entry.windSpeed} m/s</td>
	  </tr>
	  `;
		tableWeatherData.innerHTML += rowHtml;
	});
}
