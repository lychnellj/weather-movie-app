export { getCurrentLocation, showPosition, getCoordinates, getWeather, renderWeatherTable };

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
// skapar en span med felmeddelandet vid fel
function showApiError(message) {
	weatherBox.style.display = "block";
	weatherBox.innerHTML = `<span class="error">${message}</span>`;
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
			// console.log(`Latitude: ${latitude}, Longtitude: ${longitude}`); Kommenterade ut denna rad pga dublett av koordinater när jag använder fetchBtn
			return { latitude, longitude };
		} else {
			console.log("no results");
			return null;
		}
	} catch (error) {
		console.error("Fel vid hämtning av koordinater:", error);
		showApiError("Kunde inte hämta koordinater för platsen.");
		return null;
	}
}

// gör om koordinater till en prognos

async function getWeather(latitude, longitude) {
	try {
		const hourlyVars = ["temperature_2m", "precipitation", "wind_speed_10m"];
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
		//placerar respons i objects
		const forecast = times.map((time, i) => ({
			time,
			temperature: temps[i],
			rainAndSnow: precipitation[i],
			windSpeed: wind[i]
		}));
		console.log("Kommande 2 timmarnas väderprognos: ", forecast);
		return forecast;
	} catch (error) {
		console.error("Fel vid hämtning av väder:", error);
		showApiError("Kunde inte hämta koordinater för platsen.");
		return [];
	}
}

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
