
document.addEventListener("DOMContentLoaded", () => {

	const quizModal = document.createElement("div");

	quizModal.className = "quiz-modal";

	quizModal.innerHTML = `
		<div class="quiz-modal-overlay"></div>

		<section
			class="quiz-modal-box"
			role="dialog"
			aria-modal="true"
			aria-labelledby="quiz-title"
		>
			<button
				class="quiz-close"
				type="button"
				aria-label="Fermer le quiz"
			>
				<span class="material-symbols-rounded">close</span>
			</button>

			<div class="quiz-heading">
				<span class="quiz-badge">
					<span class="material-symbols-rounded">school</span>
					Quiz de début
				</span>
			</div>

			<div class="quiz-intro">
				<div class="quiz-intro-copy">
					<h2 id="quiz-title" class="quiz-title"></h2>

					<p class="quiz-instruction">
						Choisissez la bonne réponse pour continuer.
					</p>
				</div>

				<div class="quiz-mascot">
					<img src="/svg/Learning-cuate 1.svg" alt="Illustration d'apprentissage par Storyset">
				</div>
			</div>

			<div class="quiz-question-card">
				<p class="quiz-question"></p>
			</div>

			<div
				class="quiz-options"
				role="group"
				aria-label="Réponses proposées"
			></div>

			<p class="quiz-feedback" aria-live="polite"></p>

			<button
				class="quiz-submit"
				type="button"
				disabled
			>
				Vérifier la réponse
				<span class="material-symbols-rounded">
					arrow_forward
				</span>
			</button>
		</section>
	`;

	document.body.appendChild(quizModal);

	const resultToast = document.createElement("div");
	resultToast.className = "quiz-result-toast";
	resultToast.setAttribute("role", "status");
	resultToast.setAttribute("aria-live", "polite");
	resultToast.innerHTML = `
		<img src="/svg/Success factors.gif" alt="">
		<span>Bonne réponse !</span>
	`;
	document.body.appendChild(resultToast);

	let resultToastTimeout;

	function showResultToast(isCorrect) {
		const image = resultToast.querySelector("img");
		const message = resultToast.querySelector("span");

		image.src = isCorrect
			? "/svg/Success factors.gif"
			: "/svg/Discarded idea.gif";
		message.textContent = isCorrect
			? "Bonne réponse !"
			: "Mauvaise réponse !";
		resultToast.classList.toggle("is-wrong", !isCorrect);

		clearTimeout(resultToastTimeout);
		resultToast.classList.add("is-visible");
		resultToastTimeout = setTimeout(() => {
			resultToast.classList.remove("is-visible");
		}, 2200);
	}

	const quizTitle =
		quizModal.querySelector(".quiz-title");

	const quizQuestion =
		quizModal.querySelector(".quiz-question");

	const quizOptions =
		quizModal.querySelector(".quiz-options");

	const quizFeedback =
		quizModal.querySelector(".quiz-feedback");

	const quizSubmit =
		quizModal.querySelector(".quiz-submit");

	let selectedAnswer = "";
	let currentQuiz = null;
	let currentStepIndex = 0;
	let correctCount = 0;
	let isStepAnswered = false;
	let isQuizFinished = false;
	let activeCourseCard = null;
	let courseCards = [];


	/* =====================================================
	   STOCKAGE : COURS TERMINÉS ET SCORES
	===================================================== */

	const completedCourseIdsKey = "mymad.completedCourseIds";
	const courseScoresKey = "mymad.courseScores";

	function getCompletedCourseIds() {
		try {
			const completedCourseIds = JSON.parse(
				localStorage.getItem(completedCourseIdsKey) || "[]"
			);

			return new Set(
				Array.isArray(completedCourseIds)
					? completedCourseIds.map(String)
					: []
			);
		} catch {
			return new Set();
		}
	}

	function markCourseCompleted(courseId) {
		const completedCourseIds = getCompletedCourseIds();
		completedCourseIds.add(String(courseId));

		localStorage.setItem(
			completedCourseIdsKey,
			JSON.stringify([...completedCourseIds])
		);
	}

	function getCourseScores() {
		try {
			return JSON.parse(
				localStorage.getItem(courseScoresKey) || "{}"
			);
		} catch {
			return {};
		}
	}

	function setCourseScore(courseId, percentage) {
		const scores = getCourseScores();
		scores[courseId] = clampPercentage(percentage);

		localStorage.setItem(
			courseScoresKey,
			JSON.stringify(scores)
		);
	}

	function clampPercentage(value) {
		return Math.max(0, Math.min(100, Number(value) || 0));
	}


	/* =====================================================
	   VERROUILLAGE DES COURS
	===================================================== */

	function updateCourseLocks() {
		const completedCourseIds = getCompletedCourseIds();

		courseCards.forEach((card, index) => {
			const previousCourseId = courseCards[index - 1]?.dataset.courseId;
			const prerequisiteIncomplete = index > 0
				&& !completedCourseIds.has(previousCourseId);
			const serverLocked = card.dataset.courseStatus === "locked";
			const isUnlockedByProgress = index > 0 && !prerequisiteIncomplete;
			const hasNoQuestions = card.dataset.quizAvailable === "false";
			const locked = (serverLocked && !isUnlockedByProgress)
				|| prerequisiteIncomplete
				|| hasNoQuestions;

			card.classList.toggle("locked", locked);
			card.setAttribute("aria-disabled", String(locked));
			card.querySelector(
				".course-header > .material-symbols-rounded"
			).textContent = locked ? "lock" : "menu_book";
		});
	}


	/* =====================================================
	   MISE À JOUR VISUELLE DE LA PROGRESSION D'UN COURS
	===================================================== */

	function applyCourseProgress(courseCard, percentage) {
		percentage = clampPercentage(percentage);

		const progressBar =
			courseCard.querySelector(".course-progress > div");

		const progressLabel =
			courseCard.querySelector(".course-footer strong");

		const progressStatus =
			courseCard.querySelector(".course-footer span");

		if (progressBar) {
			progressBar.style.width = `${percentage}%`;
		}

		if (progressLabel) {
			progressLabel.textContent = `${percentage}%`;
		}

		if (progressStatus) {
			progressStatus.textContent =
				percentage === 100
					? "Terminé"
					: percentage > 0
						? "En cours"
						: "À commencer";
		}

		courseCard.classList.remove("start", "ongoing", "completed");

		courseCard.classList.add(
			percentage === 100
				? "completed"
				: percentage > 0
					? "ongoing"
					: "start"
		);
	}

	function refreshGlobalProgress() {

		const scores = getCourseScores();

		const globalProgressText =
			document.querySelector(".global-progress-text");

		const globalProgressValue =
			document.querySelector(".global-progress-value");

		const globalProgressBar =
			document.querySelector(".progress-bar > .progress-value");

		if (!courseCards.length) {
			return;
		}

		const completedCount = courseCards.filter(card =>
			clampPercentage(scores[card.dataset.courseId]) === 100
		).length;

		const averagePercentage = Math.round(
			courseCards.reduce(
				(sum, card) => sum + clampPercentage(scores[card.dataset.courseId]),
				0
			) / courseCards.length
		);

		if (globalProgressText) {
			globalProgressText.textContent =
				`${completedCount}/${courseCards.length} cours complétés`;
		}

		if (globalProgressValue) {
			globalProgressValue.textContent = `${averagePercentage}%`;
		}

		if (globalProgressBar) {
			globalProgressBar.style.width = `${averagePercentage}%`;
		}
	}


	/* =====================================================
	   VÉRIFIER LA DISPONIBILITÉ D'UN QUIZ + APPLIQUER LE SCORE
	===================================================== */

	function checkCourseQuizAvailability(courseCard) {
		const socket = new WebSocket("ws://26.123.107.233:9000");

		const markUnavailable = () => {
			courseCard.dataset.quizAvailable = "unknown";
			updateCourseLocks();
		};

		socket.addEventListener("open", () => {
			socket.send(`
				<?xml version="1.0" encoding="UTF-8"?>
				<request>
					<action>getQuiz</action>
					<courseId>${courseCard.dataset.courseId}</courseId>
				</request>
			`);
		});

		socket.addEventListener("message", event => {
			const message = String(event.data).trim();
			const xmlStart = message.indexOf("<");

			if (xmlStart === -1) {
				markUnavailable();
				socket.close();
				return;
			}

			const xml = new DOMParser().parseFromString(
				message.slice(xmlStart),
				"application/xml"
			);
			const quiz = xml.querySelector("parsererror")
				|| xml.querySelector("error")
				? null
				: parseQuizXml(xml);

			courseCard.dataset.quizAvailable = String(
				Boolean(quiz?.steps.length)
			);
			updateCourseLocks();
			socket.close();
		});

		socket.addEventListener("error", markUnavailable);
	}

	window.addEventListener("courses-rendered", event => {
		courseCards = event.detail.cards;

		const scores = getCourseScores();

		courseCards.forEach(card => {
			const savedPercentage = scores[card.dataset.courseId] || 0;
			applyCourseProgress(card, savedPercentage);
		});

		updateCourseLocks();
		refreshGlobalProgress();
		courseCards.forEach(checkCourseQuizAvailability);
	});


	/* =====================================================
	   FERMER LE QUIZ
	===================================================== */

	function closeQuiz() {

		quizModal.classList.remove("show");

		selectedAnswer = "";
		currentQuiz = null;
		currentStepIndex = 0;
		correctCount = 0;
		isStepAnswered = false;
		isQuizFinished = false;
		activeCourseCard = null;
	}


	/* =====================================================
	   RÉCUPÉRER LE QUIZ DEPUIS LE SERVEUR
	===================================================== */

	function loadQuiz(courseId, courseTitle, courseCard) {

		currentQuiz = null;
		selectedAnswer = "";
		currentStepIndex = 0;
		correctCount = 0;
		isStepAnswered = false;
		isQuizFinished = false;
		activeCourseCard = courseCard;

		quizTitle.textContent = courseTitle;

		quizQuestion.classList.add("is-loading");
		quizQuestion.setAttribute("aria-busy", "true");
		quizQuestion.innerHTML = `
			<span class="quiz-loading-spinner" role="status" aria-label="Chargement du quiz">
				<span class="quiz-loading-cube"><span class="quiz-loading-cube__inner"></span></span>
				<span class="quiz-loading-cube"><span class="quiz-loading-cube__inner"></span></span>
				<span class="quiz-loading-cube"><span class="quiz-loading-cube__inner"></span></span>
			</span>
		`;

		quizOptions.replaceChildren();

		quizFeedback.textContent = "";

		quizSubmit.disabled = true;

		quizModal.classList.add("show");


		const socket = new WebSocket(
			"ws://26.123.107.233:9000"
		);


		socket.addEventListener("open", () => {

			const request = `
				<?xml version="1.0" encoding="UTF-8"?>
				<request>
					<action>getQuiz</action>
					<courseId>${courseId}</courseId>
				</request>
			`;

			socket.send(request);
		});


		socket.addEventListener("message", event => {

			const message = String(event.data).trim();

			const xmlStart = message.indexOf("<");

			if (xmlStart === -1) {
				return;
			}

			const xml = new DOMParser()
				.parseFromString(
					message.slice(xmlStart),
					"application/xml"
				);

			const parserError =
				xml.querySelector("parsererror");

			if (parserError) {

				console.error(
					"XML invalide :",
					parserError.textContent
				);

				showQuizError(
					"Les données du cours sont invalides."
				);

				return;
			}


			const error =
				xml.querySelector("error");

			if (error) {

				showQuizError(
					error.querySelector("message")
						?.textContent
						.trim()
						|| "Erreur serveur."
				);

				return;
			}


			const quiz =
				parseQuizXml(xml);

			if (!quiz || quiz.steps.length === 0) {
				courseCard.classList.add("locked");
				courseCard.setAttribute("aria-disabled", "true");
				courseCard.querySelector(
					".course-header > .material-symbols-rounded"
				).textContent = "lock";

				showQuizError(
					"Aucune question disponible pour ce cours."
				);

				return;
			}


			currentQuiz = quiz;

			quizTitle.textContent =
				quiz.title || courseTitle;

			currentStepIndex = 0;

			renderStep();


			socket.close();
		});

		socket.addEventListener("error", () => {

			showQuizError(
				"Impossible de récupérer le cours."
			);
		});


		socket.addEventListener("close", () => {

			console.log(
				"Connexion quiz fermée."
			);
		});
	}


	/* =====================================================
	   TRANSFORMER XML → LISTE D'ÉTAPES (UNE PAR QUESTION)
	===================================================== */

	function parseQuizXml(xml) {

		const quizElement =
			xml.querySelector("quiz");

		if (!quizElement) {
			return null;
		}


		const title =
			quizElement.querySelector(":scope > title")
				?.textContent
				.trim()
				|| "";


		const lessonElements =
			quizElement.querySelectorAll(
				":scope > lessons > lesson"
			);


		const steps = [];


		lessonElements.forEach(lessonElement => {

			const lessonTitle =
				lessonElement.querySelector(":scope > title")
					?.textContent
					.trim()
					|| "";


			const questionElements =
				lessonElement.querySelectorAll(
					":scope > question"
				);


			questionElements.forEach(questionElement => {

				const questionText =
					questionElement.querySelector(
						":scope > text"
					)?.textContent
					.trim()
					|| "";


				const answerElements =
					questionElement.querySelectorAll(
						":scope > answers > answer"
					);


				const options = [];

				let correctAnswer = "";


				answerElements.forEach(answerElement => {

					const text =
						answerElement.querySelector(":scope > text")
							?.textContent
							.trim()
							|| "";


					const correct =
						answerElement.querySelector(":scope > correct")
							?.textContent
							.trim()
							.toLowerCase()
							=== "true";


					if (text) {

						options.push(text);

						if (correct) {
							correctAnswer = text;
						}
					}
				});


				if (questionText && options.length > 0) {

					steps.push({
						lessonTitle: lessonTitle,
						question: questionText,
						answer: correctAnswer,
						options: options
					});
				}
			});
		});


		return {
			title: title,
			steps: steps
		};
	}


	/* =====================================================
	   ERREUR
	===================================================== */

	function showQuizError(message) {

		setQuizQuestionText(message);

		quizOptions.replaceChildren();

		quizFeedback.textContent = "";

		quizSubmit.disabled = true;
	}

	function setQuizQuestionText(text) {

		quizQuestion.classList.remove("is-loading");
		quizQuestion.removeAttribute("aria-busy");
		quizQuestion.textContent = text;
	}


	/* =====================================================
	   AFFICHER UNE ÉTAPE (UNE QUESTION)
	===================================================== */

	function renderStep() {

		if (!currentQuiz ||
			!currentQuiz.steps ||
			!currentQuiz.steps.length) {

			return;
		}


		const step =
			currentQuiz.steps[currentStepIndex];

		setQuizQuestionText(step.question);


		quizOptions.replaceChildren();


		quizFeedback.textContent = "";

		quizFeedback.className =
			"quiz-feedback";


		selectedAnswer = "";
		isStepAnswered = false;


		quizSubmit.disabled = true;


		quizSubmit.onclick = null;


		quizSubmit.innerHTML =
			currentStepIndex ===
			currentQuiz.steps.length - 1

				? `Terminer le quiz
				   <span class="material-symbols-rounded">
				       check
				   </span>`

				: `Vérifier la réponse
				   <span class="material-symbols-rounded">
				       arrow_forward
				   </span>`;


		const shuffledOptions = [...step.options];
		for (let index = shuffledOptions.length - 1; index > 0; index--) {
			const randomIndex = Math.floor(Math.random() * (index + 1));
			[shuffledOptions[index], shuffledOptions[randomIndex]] =
				[shuffledOptions[randomIndex], shuffledOptions[index]];
		}

		shuffledOptions.forEach(option => {

			const optionButton =
				document.createElement("button");


			optionButton.type = "button";

			optionButton.className =
				"quiz-option";


			optionButton.textContent =
				option;


			optionButton.addEventListener(
				"click",
				() => {

					selectedAnswer = option;


					quizOptions
						.querySelectorAll(".quiz-option")
						.forEach(button => {

							button.classList.toggle(
								"selected",
								button === optionButton
							);
						});


					quizSubmit.disabled = false;
				}
			);


			quizOptions.appendChild(
				optionButton
			);
		});
	}


	/* =====================================================
	   TERMINER LE QUIZ : CALCULER ET APPLIQUER LE SCORE
	===================================================== */

	function finishQuiz() {
		isQuizFinished = true;

		const percentage = Math.round(
			(correctCount / currentQuiz.steps.length) * 100
		);

		quizFeedback.textContent =
			percentage === 100
				? "Bravo ! Vous avez tout bon, cours terminé à 100%."
				: `Quiz terminé : ${correctCount} / ${currentQuiz.steps.length} bonnes réponses (${percentage}%).`;

		quizFeedback.className =
			`quiz-feedback ${percentage === 100 ? "is-correct" : "is-wrong"}`;

		if (activeCourseCard) {

			setCourseScore(activeCourseCard.dataset.courseId, percentage);
			applyCourseProgress(activeCourseCard, percentage);

			if (percentage === 100) {
				markCourseCompleted(activeCourseCard.dataset.courseId);
			}

			updateCourseLocks();
			refreshGlobalProgress();
		}

		quizSubmit.disabled = false;

		quizSubmit.innerHTML =
			`Fermer
			 <span class="material-symbols-rounded">
			     check
			 </span>`;

		quizSubmit.onclick = () => closeQuiz();
	}


	/* =====================================================
	   VALIDATION
	===================================================== */

	quizSubmit.addEventListener("click", () => {
		if (isQuizFinished) {
			quizSubmit.onclick = null;
			closeQuiz();
			return;
		}

		if (!currentQuiz) {
			return;
		}

		if (isStepAnswered) {
			return;
		}


		const step =
			currentQuiz.steps[currentStepIndex];


		const isCorrect =
			selectedAnswer === step.answer;

		const isLastStep =
			currentStepIndex ===
			currentQuiz.steps.length - 1;


		if (isCorrect) {
			correctCount++;
		}

		isStepAnswered = true;


		if (isCorrect) {
			quizFeedback.textContent = "";
			quizFeedback.className = "quiz-feedback";
			showResultToast(true);
		} else {
			quizFeedback.textContent =
				`La bonne réponse était : ${step.answer}`;
			quizFeedback.className = "quiz-feedback is-wrong";
			showResultToast(false);
		}


		quizOptions
			.querySelectorAll(".quiz-option")
			.forEach(option => {

				option.classList.toggle(
					"is-correct",
					option.textContent === step.answer
				);


				option.classList.toggle(
					"is-wrong",
					!isCorrect &&
					option.textContent === selectedAnswer
				);
			});


		// On peut TOUJOURS avancer, correct ou pas
		quizSubmit.disabled = false;

		if (!isLastStep) {

			quizSubmit.innerHTML =
				`Question suivante
				 <span class="material-symbols-rounded">
				     arrow_forward
				 </span>`;

			quizSubmit.onclick = () => {
				currentStepIndex++;
				renderStep();
			};

		} else {

			quizSubmit.innerHTML =
				`Voir mon résultat
				 <span class="material-symbols-rounded">
				     check
				 </span>`;

			quizSubmit.onclick = () => finishQuiz();
		}
	});


	/* =====================================================
	   CLIQUER SUR UN COURS
	===================================================== */

	document
		.querySelector(".course-grid")
		?.addEventListener("click", event => {

			const courseCard =
				event.target.closest(".course-card");


			if (!courseCard) {
				return;
			}

			if (courseCard.classList.contains("locked")) {
				return;
			}


			const courseId =
				courseCard.dataset.courseId;


			const courseTitle =
				courseCard.dataset.courseTitle;


			if (!courseId) {

				console.error(
					"ID du cours introuvable."
				);

				return;
			}


			loadQuiz(
				courseId,
				courseTitle,
				courseCard
			);
			
		});


	/* =====================================================
	   FERMETURE
	===================================================== */

	quizModal
		.querySelector(".quiz-close")
		.addEventListener(
			"click",
			closeQuiz
		);


	quizModal
		.querySelector(".quiz-modal-overlay")
		.addEventListener(
			"click",
			closeQuiz
		);
});
