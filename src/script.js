import { getCurrentLocation, showPosition, getCoordinates, getWeather, renderWeatherTable, getCityNameFromCoords } from "./weatherCoords.js";
import { displayMovie, mayThe4Th, findRandomMovies, getPosterUrl } from "./movieFinder.js";
import { fetchICS, parseEvents, filterToday, getTodayEvent } from "./pastaCal.js";
import { cleanCityList, loadSwedenCities } from "./manualSearch.js";
import { DEVELOPMENT } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
	getCurrentLocation();
	loadSwedenCities();
});

async function renderPastafarianCalendar() {
	const { result, dateString } = await getTodayEvent();

	const pasContainer = document.querySelector(".pasResult");

	if (result.events.length > 0) {
		pasContainer.innerHTML = `${result.events.map((e) => e.title)}`;
	} else {
		pasContainer.innerHTML = `${dateString} finns inget i Pastafarian-kalendern.`;
	}
}

renderPastafarianCalendar();
