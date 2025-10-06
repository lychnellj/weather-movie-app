export { fetchICS, parseEvents, filterToday, getTodayEvent };

// hämtar ICS-fil och städar texten
async function fetchICS(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Kunde inte hämta ${url}: ${response.status}`);
		}
		const txt = await response.text();
		return txt.replace(/\r?\n[ \t]/g, "");
	} catch (err) {
		console.error("Fel vid hämtning av ICS:", err);
		return "";
	}
}

function parseEvents(icsText) {
	const rawEvents = icsText.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
	return rawEvents
		.map((ev) => {
			const start = (ev.match(/DTSTART[^:]*:(\d{8})/) || [])[1];
			const summary = (ev.match(/SUMMARY:(.+?)\r?\n/) || [])[1];
			return { start, summary };
		})
		.filter((e) => e.start && e.summary);
}

function filterToday(events, todayYmd) {
	return events.filter((e) => e.start === todayYmd);
}

async function getTodayEvent() {
	const tz = "Europe/Stockholm";
	const date = new Date();

	// formatera datumet till YYYYMMDD
	const ymd = new Intl.DateTimeFormat("sv-SE", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	})
		.format(date)
		.replace(/-/g, "");

	const icsText = await fetchICS("./feed.ics");

	const events = parseEvents(icsText);
	const todayEvents = filterToday(events, ymd);

	const result = {
		date: ymd,
		events: todayEvents.map((e) => ({ title: e.summary }))
	};
	const dateString = new Intl.DateTimeFormat("sv-SE", {
		timeZone: tz,
		year: "2-digit",
		month: "2-digit",
		day: "numeric"
	}).format(date);

	return { result, dateString };
}
