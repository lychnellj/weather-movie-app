import { getCurrentLocation, showPosition, getCoordinates, getWeather, renderWeatherTable, getCityNameFromCoords } from "./weatherCoords.js";
import { displayMovie, mayThe4Th, findRandomMovies } from "./movieFinder.js";
import { fetchICS, parseEvents, filterToday, getTodayEvent } from "./pastaCal.js";
import { cleanCityList, loadSwedenCities } from "./manualSearch.js";

window.addEventListener("DOMContentLoaded", () =>{
	const audio = document.getElementById("startUpSound");
	if (audio)
		audio.volume = 0.1;
		audio.play().catch(() => {});
});

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

// ändrar details-taggar så dom öppnas automatiskt vid desktopläge
function openDetails() {
	const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
	document.querySelectorAll('details').forEach(details => {
		details.open = isDesktop;
	});
}

window.addEventListener('resize', openDetails);
window.addEventListener('DOMContentLoaded', openDetails);
// kollar om ändringar sker och kör openDetails
const observer = new MutationObserver(() => {
	openDetails();
});

observer.observe(document.body, {childList: true, subtree: true});