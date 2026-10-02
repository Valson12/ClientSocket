/* =====================================================
   MYMAD - INTERACTIONS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".search-input");
    const searchButton = document.querySelector(".search-button");

    function performSearch() {

        const query = searchInput.value.trim().toLowerCase();

        const lessonItems = document.querySelectorAll(".lesson-item");
        const planningItems = document.querySelectorAll(".planning-item");
        const rewardItems = document.querySelectorAll(".reward-item");

        if (query === "") {

            lessonItems.forEach(item => item.style.display = "");
            planningItems.forEach(item => item.style.display = "");
            rewardItems.forEach(item => item.style.display = "");

            return;
        }

        lessonItems.forEach(item => {

            const text = item.textContent.toLowerCase();

            item.style.display =
                text.includes(query) ? "" : "none";
        });

        planningItems.forEach(item => {

            const text = item.textContent.toLowerCase();

            item.style.display =
                text.includes(query) ? "" : "none";
        });

        rewardItems.forEach(item => {

            const text = item.textContent.toLowerCase();

            item.style.display =
                text.includes(query) ? "" : "none";
        });
    }


    if (searchInput) {

        searchInput.addEventListener("input", performSearch);

        searchInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                performSearch();
            }

        });
    }


    if (searchButton) {

        searchButton.addEventListener("click", performSearch);
    }


    /* =================================================
       MODAL
    ================================================= */

    const modal = document.createElement("div");

    modal.className = "content-modal";

    modal.innerHTML = `
        <div class="content-modal-overlay"></div>

        <div class="content-modal-box">

            <button class="modal-close">
                <span class="material-symbols-rounded">
                    close
                </span>
            </button>

            <div class="modal-icon">
                <span class="material-symbols-rounded">
                    info
                </span>
            </div>

            <h2 class="modal-title"></h2>

            <p class="modal-description"></p>

            <button class="modal-action">
                Continuer
            </button>

        </div>
    `;

    document.body.appendChild(modal);


    const modalTitle =
        modal.querySelector(".modal-title");

    const modalDescription =
        modal.querySelector(".modal-description");

    const modalIcon =
        modal.querySelector(".modal-icon span");

    const modalAction =
        modal.querySelector(".modal-action");


    function openModal(title, description, icon = "info") {

        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalIcon.textContent = icon;

        modal.classList.add("show");
    }


    function closeModal() {

        modal.classList.remove("show");
    }

    window.openContentModal = openModal;


    modal.querySelector(".modal-close")
        .addEventListener("click", closeModal);

    modal.querySelector(".content-modal-overlay")
        .addEventListener("click", closeModal);


    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeModal();
        }

    });

    const lessons = document.querySelectorAll(".lesson-item");

    lessons.forEach(lesson => {

        lesson.classList.add("interactive-item");

        lesson.addEventListener("click", () => {

            const title =
                lesson.querySelector(".lesson-top strong")
                    ?.textContent.trim();

            const level =
                lesson.querySelector(".lesson-level")
                    ?.textContent.trim();

            const status =
                lesson.querySelector(".lesson-status")
                    ?.textContent.trim();

            const progress =
                lesson.querySelector(".lesson-progress-text strong")
                    ?.textContent.trim();

            openModal(
                title || "Leçon",
                `${level || ""} • ${status || ""} • Progression : ${progress || "0%"}`,
                "menu_book"
            );

        });

    });
    const planningItems =
        document.querySelectorAll(".planning-item");

    planningItems.forEach(item => {

        item.classList.add("interactive-item");

        item.addEventListener("click", () => {

            const title =
                item.querySelector(".planning-info strong")
                    ?.textContent.trim();

            const date =
                item.querySelector(".planning-date")
                    ?.textContent.trim();

            const time =
                item.querySelector(".planning-info span")
                    ?.textContent.trim();

            openModal(
                title || "Activité",
                `Date : ${date || ""} • ${time || ""}`,
                "event"
            );

        });

    });


    const rewards =
        document.querySelectorAll(".reward-item");

    rewards.forEach(reward => {

        reward.classList.add("interactive-item");

        reward.addEventListener("click", () => {

            const title =
                reward.querySelector("strong")
                    ?.textContent.trim();

            const description =
                reward.querySelector(":scope > span")
                    ?.textContent.trim();

            openModal(
                title || "Récompense",
                description || "Récompense obtenue.",
                "workspace_premium"
            );

        });

    });


    const weekDays =
        document.querySelectorAll(".week-days span");

    weekDays.forEach(day => {

        day.addEventListener("click", () => {

            weekDays.forEach(item => {
                item.classList.remove("selected");
            });

            day.classList.add("selected");

        });

    });


    const notificationButton =
        document.querySelector(".header-icon");


    if (notificationButton) {

        const notificationPanel =
            document.createElement("div");

        notificationPanel.className =
            "notification-panel";

        notificationPanel.innerHTML = `
            <div class="notification-header">
                <strong>Notifications</strong>
                <span>3 nouvelles</span>
            </div>

            <div class="notification-item">
                <span class="material-symbols-rounded">
                    school
                </span>

                <div>
                    <strong>Nouvelle leçon</strong>
                    <p>La leçon de vocabulaire est disponible.</p>
                </div>
            </div>

            <div class="notification-item">
                <span class="material-symbols-rounded">
                    workspace_premium
                </span>

                <div>
                    <strong>Nouvelle récompense</strong>
                    <p>Vous avez débloqué une récompense.</p>
                </div>
            </div>

            <div class="notification-item">
                <span class="material-symbols-rounded">
                    schedule
                </span>

                <div>
                    <strong>Rappel</strong>
                    <p>Votre prochaine séance commence bientôt.</p>
                </div>
            </div>
        `;

        document.body.appendChild(notificationPanel);


        notificationButton.addEventListener("click", event => {

            event.stopPropagation();

            notificationPanel.classList.toggle("show");

        });


        document.addEventListener("click", event => {

            if (
                !notificationPanel.contains(event.target) &&
                !notificationButton.contains(event.target)
            ) {
                notificationPanel.classList.remove("show");
            }

        });

    }

    const avatar =
        document.querySelector(".user-avatar");


    if (avatar) {

        const profileMenu =
            document.createElement("div");

        profileMenu.className =
            "profile-menu";

        profileMenu.innerHTML = `
            <div class="profile-header">

                <div class="profile-avatar">
                    <img
                        src="https://i.pravatar.cc/100?img=12"
                        alt="Profil"
                    >
                </div>

                <div>
                    <strong>Sofia Rakoto</strong>
                    <span>Apprenante</span>
                </div>

            </div>

            <button>
                <span class="material-symbols-rounded">
                    person
                </span>
                Mon profil
            </button>

            <button>
                <span class="material-symbols-rounded">
                    settings
                </span>
                Paramètres
            </button>

            <button class="profile-logout">
                <span class="material-symbols-rounded">
                    logout
                </span>
                Déconnexion
            </button>
        `;

        document.body.appendChild(profileMenu);


        avatar.addEventListener("click", event => {

            event.stopPropagation();

            profileMenu.classList.toggle("show");

        });


        document.addEventListener("click", event => {

            if (
                !profileMenu.contains(event.target) &&
                !avatar.contains(event.target)
            ) {
                profileMenu.classList.remove("show");
            }

        });

    }


    /* =================================================
       SCORE ITEMS
    ================================================= */

    const scoreItems =
        document.querySelectorAll(".score-item");

    scoreItems.forEach(item => {

        item.classList.add("interactive-item");

        item.addEventListener("click", () => {

            const title =
                item.querySelector(".score-header strong")
                    ?.textContent.trim();

            const scoreElements =
                item.querySelectorAll(".score-header strong");

            const score =
                scoreElements.length > 1
                    ? scoreElements[1].textContent.trim()
                    : "";

            openModal(
                title || "Score",
                `Votre score : ${score}`,
                "analytics"
            );

        });

    });


    /* =================================================
       STUDY TIME
    ================================================= */

    const studyItems =
        document.querySelectorAll(".study-item");

    studyItems.forEach(item => {

        item.classList.add("interactive-item");

        item.addEventListener("click", () => {

            const day =
                item.querySelector(":scope > span")
                    ?.textContent.trim();

            const duration =
                item.querySelector(":scope > strong")
                    ?.textContent.trim();

            openModal(
                `Temps d'étude - ${day}`,
                `Vous avez étudié pendant ${duration}.`,
                "schedule"
            );

        });

    });


    /* =================================================
       MODAL ACTION
    ================================================= */

    modalAction.addEventListener("click", () => {

        closeModal();

    });

});