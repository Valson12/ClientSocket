/* =====================================================
   MYMAD - COURSE LOADING
===================================================== */

// function displayCourses(courses) {
// 	const courseGrid = document.querySelector(".course-grid");

// 	if (!courseGrid) {
// 		return;
// 	}

// 	courseGrid.replaceChildren();

// 	courses.forEach((course, index) => {
// 		const readValue = (...names) => {
// 			for (const name of names) {
// 				const value = course.querySelector(name)?.textContent.trim();

// 				if (value) {
// 					return value;
// 				}
// 			}

// 			return "";
// 		};

// 		const title = readValue("title", "titre", "name", "nom") || "Cours";
// 		const description = readValue("description", "desc");
// 		const level = readValue("level", "niveau");
// 		const lessons = readValue("lessons", "lecons", "lessonCount");
// 		const progressValue = readValue("progress", "progression") || "0";
// 		const progress = Math.max(0, Math.min(100, Number.parseInt(progressValue, 10) || 0));
// 		const status = readValue("status", "statut") || "start";

// 		const card = document.createElement("article");
// 		card.className = `course-card ${status} course-color-${(index % 4) + 1}`;
// 		card.dataset.courseTitle = title;
// 		card.innerHTML = `
// 			<div class="course-header">
// 				<div>
// 					<h3></h3>
// 					<p></p>
// 				</div>
// 				<span class="material-symbols-rounded">menu_book</span>
// 			</div>
// 			<span class="course-lessons"></span>
// 			<div class="course-progress">
// 				<div></div>
// 			</div>
// 			<div class="course-footer">
// 				<span>Progression</span>
// 				<strong>${progress}%</strong>
// 			</div>
// 		`;

// 		card.querySelector("h3").textContent = title;
// 		card.querySelector(".course-header p").textContent = [level, description]
// 			.filter(Boolean)
// 			.join(" • ");
// 		card.querySelector(".course-lessons").textContent = lessons
// 			? `${lessons} leçon(s)`
// 			: "Cours disponible";
// 		card.querySelector(".course-progress div").style.width = `${progress}%`;

// 		courseGrid.appendChild(card);
// 	});

// 	if (courses.length === 0) {
// 		courseGrid.innerHTML = "<p>Aucun cours disponible.</p>";
// 	}
// }
function displayCourses(courses) {
	const courseGrid = document.querySelector(".course-grid");

	if (!courseGrid) {
		return;
	}

	courseGrid.replaceChildren();

	courses.forEach((course, index) => {

		const readValue = (...names) => {

			for (const name of names) {

				const value =
					course.querySelector(name)?.textContent.trim();

				if (value) {
					return value;
				}
			}

			return "";
		};
		const id = readValue("id", "courseId");

		const title =
			readValue(
				"title",
				"titre",
				"name",
				"nom"
			) || "Cours";

		const description =
			readValue(
				"description",
				"desc"
			);

		const level =
			readValue(
				"level",
				"niveau"
			);

		const lessons =
			readValue(
				"lessons",
				"lecons",
				"lessonCount",
				"nombreLecons"
			);

		const progressValue =
			readValue(
				"progress",
				"progression"
			) || "0";

		const progress =
			Math.max(
				0,
				Math.min(
					100,
					Number.parseInt(
						progressValue,
						10
					) || 0
				)
			);

		const status =
			readValue(
				"status",
				"statut"
			) || "start";


		const card =
			document.createElement("article");


		card.className =
			`course-card ${status} course-color-${(index % 4) + 1}`;


		card.dataset.courseId = id;

		card.dataset.courseTitle = title;
		card.dataset.courseIndex = String(index);
		card.dataset.courseStatus = status;
		card.dataset.quizAvailable = "checking";


		card.innerHTML = `
			<div class="course-header">
				<div>
					<h3></h3>
					<p></p>
				</div>

				<span class="material-symbols-rounded">
					${status === "locked" ? "lock" : "menu_book"}
				</span>
			</div>

			<span class="course-lessons"></span>

			<div class="course-progress">
				<div></div>
			</div>

			<div class="course-footer">
				<span>Progression</span>
				<strong>${progress}%</strong>
			</div>
		`;


		card.querySelector("h3").textContent =
			title;


		card.querySelector(
			".course-header p"
		).textContent =
			[level, description]
				.filter(Boolean)
				.join(" • ");


		card.querySelector(
			".course-lessons"
		).textContent =
			lessons
				? `${lessons} leçon(s)`
				: "Cours disponible";


		card.querySelector(
			".course-progress div"
		).style.width =
			`${progress}%`;


		console.log("Cours chargé :", {
			id: id,
			title: title
		});


		courseGrid.appendChild(card);
	});


	if (courses.length === 0) {

		courseGrid.innerHTML =
			"<p>Aucun cours disponible.</p>";
	}

	window.dispatchEvent(new CustomEvent("courses-rendered", {
		detail: {
			cards: Array.from(courseGrid.querySelectorAll(".course-card"))
		}
	}));
}

document.addEventListener("DOMContentLoaded", () => {
	const loadingState = document.querySelector(".courses-loading");
	const loadingMessage = loadingState?.querySelector("p");
	const loadingIcon = loadingState?.querySelector(".material-symbols-rounded");
	const connectionErrorImage = loadingState?.querySelector(".connection-error-image");
	const retryButton = loadingState?.querySelector(".connection-retry");
	const profileAvatar = document.querySelector(".user-avatar");

	const updateLoadingState = connectionState => {
		const state = typeof connectionState === "string"
			? connectionState
			: connectionState.status;

		profileAvatar?.classList.toggle("is-online", state === "ready");
		profileAvatar?.setAttribute(
			"aria-label",
			state === "ready" ? "Profil connecté" : "Profil hors ligne"
		);

		if (!loadingState) {
			return;
		}

		loadingState.classList.toggle("is-hidden", state === "ready");
		loadingState.classList.toggle("has-error", state === "error");

		if (retryButton) {
			retryButton.hidden = state !== "error";
		}

		if (state === "loading") {
			loadingState.hidden = false;
			loadingState.classList.remove("is-hidden", "has-error");
			if (loadingMessage) {
				loadingMessage.textContent = "Connexion au serveur...";
				loadingMessage.hidden = false;
			}
			if (loadingIcon) {
				loadingIcon.textContent = "sync";
				loadingIcon.hidden = false;
			}
			if (connectionErrorImage) {
				connectionErrorImage.hidden = true;
			}
		}

		if (loadingMessage && state === "error") {
			loadingMessage.hidden = true;
		}

		if (loadingIcon && state === "error") {
			loadingIcon.hidden = true;
		}

		if (connectionErrorImage && state === "error") {
			connectionErrorImage.hidden = false;
		}

	};

	const connectToServer = () => {
		updateLoadingState("loading");
		connectWebSocket(displayCourses, updateLoadingState);
	};

	connectToServer();
	retryButton?.addEventListener("click", connectToServer);
});
