import { getCoordinates, getWeather, renderWeatherStatus, renderWeatherTable } from "./weatherCoords.js";
export { cleanCityList, loadSwedenCities };

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

////////THIS IS NEW 
async function loadSwedenCities() {
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
}

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
			// locationLabel.textContent = "📍 " + this.textContent;
			//cityInput.value = "";
        });

        // Lägger till <li> i dropdownlistan
        dropdown.appendChild(li);
    }

    // Gör dropdownen synlig efter att ha fyllt den med li
    dropdown.style.display = "block";
});

// Stänger dropdown om man klickar utanför
document.addEventListener("click", function (e) {
    if (!e.target.closest(".searchContainer")) {
        dropdown.style.display = "none";
    }
});

cityInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        fetchBtn.click();
    }
});

// Stänger dropdown om man trycker på esc
document.addEventListener("keydown", function(e){
    if (e.key === "Escape"){
        dropdown.style.display = "none";
    }
});

const locationLabel = document.querySelector(".locationLabel");
const locationError = document.querySelector(".locationError")

// Hämta plats knapp FUNKTION
fetchBtn.addEventListener("click", async function () {
    const city = cityInput.value;

    // Om ingen stad vald avbryt
    if (!city) {
        //console.log("Ingen stad vald.");
        locationError.innerHTML = `<span class="error">Ingen stad vald.</span>`;
        return;
    }
	locationLabel.textContent = "📍 " + city;
    const result = await getCoordinates(city);

    if (result) {
        console.log("Stadens position:", result.latitude, result.longitude);

        const forecast = await getWeather(result.latitude, result.longitude);

        const weatherBox = document.querySelector(".weatherBox");
        weatherBox.style.display = "block";
        renderWeatherStatus(forecast);
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
