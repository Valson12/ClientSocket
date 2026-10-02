
function connectWebSocket(onCourses, onConnectionState) {
	const socket = new WebSocket("ws://localhost:9000");

	const updateConnectionState = state => {
		if (typeof onConnectionState === "function") {
			onConnectionState(state);
		}
	};

	socket.addEventListener("open", () => {
		console.log(" Connecté au serveur MyMAD");
		updateConnectionState("loading");

		socket.send(`
			<?xml version="1.0" encoding="UTF-8"?>
			<request>
				<action>getCours</action>
			</request>
		`);
	});

	socket.addEventListener("message", event => {
		console.log(" Serveur :", event.data);

		const message = String(event.data).trim();
		const xmlDeclarationStart = message.indexOf("<?xml");
		const xmlTagStart = message.indexOf("<");
		const xmlStart = xmlDeclarationStart !== -1
			? xmlDeclarationStart
			: xmlTagStart;

		if (xmlStart === -1) {
			console.info(" Message serveur ignoré : il ne contient pas de XML.");
			return;
		}

		const xml = new DOMParser().parseFromString(
			message.slice(xmlStart),
			"application/xml"
		);

		const parserError = xml.querySelector("parsererror");

		if (parserError) {
			console.error("❌ XML invalide :", parserError.textContent);
			return;
		}

		const courses = xml.querySelectorAll("course");
		console.log("Nombre de cours reçus :", courses.length);

		if (typeof onCourses === "function") {
			onCourses(courses);
		}

		updateConnectionState("ready");
	});

	socket.addEventListener("error", error => {
		console.error("❌ WebSocket :", error);
		updateConnectionState({
			status: "error",
			code: "WS-ERROR"
		});
	});

	socket.addEventListener("close", event => {
		console.log("🔴 WebSocket fermé");
		updateConnectionState({
			status: "error",
			code: `WS-${event.code || 1006}`
		});
	});

	return socket;
}
