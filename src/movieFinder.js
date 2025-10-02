export { displayMovie, mayThe4Th, findRandomMovies };

/* ====================== HITTA FILM ====================================== */

//const som kopplar ihop funktionen findRandomMovies med div suggBox i html
const newSugg = document.querySelector(".suggBtn");

// startar funktionen findRandomMovies när användaren klickar på knappen
newSugg.addEventListener("click", findRandomMovies);

//personlig api-nyckel för tmdb
const tmdbApi = "17caf92753b690ca208f861025042240";

//kopplat till display av film + vägen till poster som finns i tmdb,
// skriver ut i konsolen och berättar vilken indexplats respektive movie ska hämtas ifrån || sammanstråla med birgittas display-kod
function displayMovie(movies) {
	const movie1 = movies[0];
	const posterUrl = `https://image.tmdb.org/t/p/w500${movie1.poster_path}`;

	const movie2 = movies[1];
	const posterUrl2 = `https://image.tmdb.org/t/p/w500${movie2.poster_path}`;

	// Visar filmerna på skärmen
	const container = document.querySelector(".moviesContainer");
	container.innerHTML = "";

	// Skapar filmkortet
	function createMovieCard(movie, posterUrl) {
		const card = document.createElement("div");
		card.className = "classMovieCard";

		const title = document.createElement("h2");
		title.textContent = movie.title + " " + `(${movie.release_date.slice(0, 4)})`;

		const img = document.createElement("img");
		img.src = posterUrl;
		img.alt = movie.title + " poster";
		img.style.width = "200px";

		// skapar en låda för beskrivningen
		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.textContent = "Visa beskrivning";

		const overview = document.createElement("p");
		overview.textContent = movie.overview || "Ingen beskrivning tillgänglig.";
		// trycker in summary och overview in i details-taggen
		details.appendChild(summary);
		details.appendChild(overview);

		card.appendChild(title);
		card.appendChild(img);
		card.appendChild(details);

		return card;
	}

	container.appendChild(createMovieCard(movie1, posterUrl));
	container.appendChild(createMovieCard(movie2, posterUrl2));

	// visa suggButn när filmer har presenterats så man kan reshuffla
	const suggBtn = document.querySelector(".suggBtn");
	if (suggBtn) suggBtn.style.display = "block";
}

//kollar om dagens datum är den 4 maj (may the 4th be with you)
function mayThe4Th() {
	const today = new Date();
	return today.getMonth() === 4 && today.getDate() === 4;
}

//async säger till programmet att något kommer ta tid och att inte blockera programmet "hitta en random film" under tiden
async function findRandomMovies() {
	try {
		//skapar en let-variabel för sourceList som kommer innehålla listan av filmer
		let sourceList;

		//om det är fjärde maj så hämtas json-filerna med hjälp av api från tmdb för att hitta en random star wars film
		if (mayThe4Th()) {
			const starWarsUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApi}&language=sv-SE&query=star+wars`;

			//await på att fetchen ska bli klar innan den går vidare
			const starWarsResponse = await fetch(starWarsUrl);
			const starWarsData = await starWarsResponse.json();
			sourceList = starWarsData.results;

			//kollar så att det finns minst två star wars-filmer i listan och väljer 2 slumpmässigt
			if (sourceList && sourceList.length >= 2) {
				let index1 = Math.floor(Math.random() * sourceList.length);
				let index2;

				//den körs så länge titeln på den andra filmen är samma som den första så inte samma titel väljs movie1 och movie2
				do {
					index2 = Math.floor(Math.random() * sourceList.length);
				} while (index2 === index1);

				//en array med 2 filmer skapas
				const twoRandomSwMovies = [sourceList[index1], sourceList[index2]];

				//visar filmerna och info
				displayMovie(twoRandomSwMovies);
			} else {
				console.log("Inte tillräckligt med Star Wars-filmer hittades.");
			}

			//om det inte är fjärde maj så körs denna kod
		} else {
			//använder randomer för att ta en slumpmässig sida från top rated movies
			const randomPage = Math.floor(Math.random() * 20) + 1;
			const topRatedUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${tmdbApi}&language=sv-SE&page=${randomPage}`;
			const topRatedResponse = await fetch(topRatedUrl);
			const topRatedData = await topRatedResponse.json();
			sourceList = topRatedData.results;
			let index1 = Math.floor(Math.random() * sourceList.length);
			let index2;
			do {
				index2 = Math.floor(Math.random() * sourceList.length);
			} while (index2 === index1);
			const twoMovies = [sourceList[index1], sourceList[index2]];
			displayMovie(twoMovies);
		}
	} catch (err) {
		console.error("fel: ", err);
	}
}
