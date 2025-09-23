// hämtar browserns geodata (om tillgänglig)
function getCurrentLocation() {
	console.log("fetching location...");
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	} else {
		getCoordinates();
	}
}
// lagrar position
function showPosition(position) {
	const latitude = position.coords.latitude;
	const longitude = position.coords.longitude;
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
		console.log(`Latitude: ${latitude}, Longtitude: ${longitude}`);
		return { latitude, longitude };
	} else {
		console.log("no results");
		return null;
	}
}

getCoordinates("lagos");
getCurrentLocation();

// todo, slänga in koordinater i väderapi
