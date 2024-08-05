// content.js

// Función para extraer datos del perfil de LinkedIn
function extractProfileData() {
    const profileData = {
        // Información general
        name: document.querySelector('.top-card-layout__title')?.innerText.trim() || 'Nombre no encontrado',
        headline: document.querySelector('.top-card-layout__headline')?.innerText.trim() || 'Titular no encontrado',
        location: document.querySelector('.top-card__subline-item')?.innerText.trim() || 'Ubicación no encontrada',
        followers: document.querySelector('.top-card__subline-item:nth-child(2)')?.innerText.trim() || 'Seguidores no encontrados',
        connections: document.querySelector('.top-card__subline-item--bullet')?.innerText.trim() || 'Conexiones no encontradas',

        // Posiciones actuales y pasadas
        currentPositions: Array.from(document.querySelectorAll('[data-section="currentPositionsDetails"] .top-card-link__description')).map(el => el.innerText.trim()),
        pastPositions: Array.from(document.querySelectorAll('[data-section="pastPositionsDetails"] .top-card-link__description')).map(el => el.innerText.trim()),

        // Educación, experiencia, certificaciones, proyectos, puntajes de pruebas, lenguajes y recomendaciones
        education: extractEducationData(),
        experiences: extractExperienceData(),
        certifications: extractCertificationsData(),
        projects: extractProjectsData(),
        scores: extractScoresData(),
        languages: extractLanguagesData(),
        recommendations: extractRecommendationsData()
    };

    // Envía los datos al popup
    try {
        chrome.runtime.sendMessage({ action: 'profileData', data: profileData }, (response) => {
            if (chrome.runtime.lastError) {
                // Puedes manejar el error aquí sin mostrarlo en la consola
                // Por ejemplo, puedes mostrar una alerta o simplemente ignorar el error
            } else {
            }
        });
    } catch (error) {
    }
}

// Función para extraer educación
function extractEducationData() {
    const educationList = [];
    const educationItems = document.querySelectorAll('.education__list-item');
    educationItems.forEach((item) => {
        const universityElement = item.querySelector('.profile-section-card__title-link');
        const degreeElement = item.querySelector('.education__item--degree-info');
        const dateElement = item.querySelector('.education__item--duration .date-range');

        const university = universityElement ? universityElement.innerText.trim() : 'Universidad no encontrada';
        const degree = degreeElement ? degreeElement.innerText.trim() : 'Título no encontrado';

        let startDate = null;
        let endDate = null;
        if (dateElement) {
            const dateText = dateElement.innerText.trim();
            const dateParts = dateText.split(' - ');
            if (dateParts[0]) {
                startDate = parseYear(dateParts[0]);
            }
            if (dateParts[1]) {
                endDate = parseYear(dateParts[1]);
            }
        }

        educationList.push({ university, degree, startDate, endDate });
    });
    return educationList;
}

// Función para extraer experiencia
function extractExperienceData() {
    const experiences = [];
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach((item) => {
        const titleElement = item.querySelector('.profile-section-card__title');
        const companyElement = item.querySelector('.profile-section-card__subtitle a');
        const dateElement = item.querySelector('.experience-item__duration .date-range');
        const locationElement = item.querySelector('.experience-item__location');

        const title = titleElement ? titleElement.innerText.trim() : 'Título no encontrado';
        const company = companyElement ? companyElement.innerText.trim() : 'Compañía no encontrada';
        const location = locationElement ? locationElement.innerText.trim() : 'Ubicación no encontrada';

        let startDate = null;
        let endDate = null;
        let duration = '';

        if (dateElement) {
            const dateText = dateElement.innerText.trim();
            const dateParts = dateText.split(' - ');

            if (dateParts[0]) {
                startDate = parseDate(dateParts[0]);
            }
            if (dateParts[1]) {
                if (dateParts[1].includes('Present')) {
                    endDate = null;
                } else {
                    endDate = parseDate(dateParts[1]);
                }
            }
            const durationMatch = dateElement.innerText.match(/\d+\s(year|month|year(s)?|month(s)?)/g);
            duration = durationMatch ? durationMatch.join(' ') : '';
        }

        experiences.push({ title, company, location, startDate, endDate, duration });
    });
    return experiences;
}

// Función para extraer certificaciones
function extractCertificationsData() {
    const certificationsList = [];
    const certificationItems = document.querySelectorAll('.certifications__list .profile-section-card');
    certificationItems.forEach((item) => {
        const titleElement = item.querySelector('.profile-section-card__title');
        const issuerElement = item.querySelector('.profile-section-card__subtitle a');
        const dateElement = item.querySelector('.certifications__start-date time');

        const title = titleElement ? titleElement.innerText.trim() : 'Certificación no encontrada';
        const issuer = issuerElement ? issuerElement.innerText.trim() : 'Emisor no encontrado';
        const issueDate = dateElement ? parseDate(dateElement.innerText.trim()) : null;

        certificationsList.push({ title, issuer, issueDate });
    });
    return certificationsList;
}

// Función para extraer proyectos
function extractProjectsData() {
    const projectsList = [];
    const projectItems = document.querySelectorAll('.projects__list .profile-section-card');
    projectItems.forEach((item) => {
        const titleElement = item.querySelector('h3');
        const dateElement = item.querySelector('.date-range time');
        const collaboratorsElements = item.querySelectorAll('.face-pile__url');

        const title = titleElement ? titleElement.innerText.trim() : 'Proyecto no encontrado';
        const startDate = dateElement ? parseDate(dateElement.innerText.trim()) : null;

        const collaborators = [];
        collaboratorsElements.forEach((collaboratorElement) => {
            const name = collaboratorElement.title.trim();
            const profileUrl = collaboratorElement.href;
            collaborators.push({ name, profileUrl });
        });

        projectsList.push({ title, startDate, collaborators });
    });
    return projectsList;
}

// Función para extraer puntajes de pruebas
function extractScoresData() {
    const scoresList = [];
    const scoreItems = document.querySelectorAll('.scores__list .profile-section-card');
    scoreItems.forEach((item) => {
        const titleElement = item.querySelector('.profile-section-card__title');
        const scoreElement = item.querySelector('.profile-section-card__subtitle');
        const dateElement = item.querySelector('.date-range time');

        const title = titleElement ? titleElement.innerText.trim() : 'Prueba no encontrada';
        const score = scoreElement ? scoreElement.innerText.trim() : 'Puntuación no encontrada';
        const date = dateElement ? parseDate(dateElement.innerText.trim()) : null;

        scoresList.push({ title, score, date });
    });
    return scoresList;
}

// Función para extraer idiomas
function extractLanguagesData() {
    const languagesList = [];
    const languageItems = document.querySelectorAll('.languages__list .profile-section-card');
    languageItems.forEach((item) => {
        const languageElement = item.querySelector('.profile-section-card__title');
        const proficiencyElement = item.querySelector('.profile-section-card__subtitle');

        const language = languageElement ? languageElement.innerText.trim() : 'Idioma no encontrado';
        const proficiency = proficiencyElement ? proficiencyElement.innerText.trim() : 'Competencia no encontrada';

        languagesList.push({ language, proficiency });
    });
    return languagesList;
}

// Función para extraer recomendaciones
function extractRecommendationsData() {
    const recommendationsList = [];
    const recommendationItems = document.querySelectorAll('.recommendations__list-item');
    recommendationItems.forEach((item) => {
        const authorElement = item.querySelector('.base-main-card__title');
        const contentElement = item.querySelector('.endorsement-card__content');
        const profileLinkElement = item.querySelector('.endorsement-card a');

        const author = authorElement ? authorElement.innerText.trim() : 'Autor no encontrado';
        const content = contentElement ? contentElement.innerText.trim() : 'Contenido no encontrado';
        const profileLink = profileLinkElement ? profileLinkElement.href : 'Enlace de perfil no encontrado';

        recommendationsList.push({ author, content, profileLink });
    });
    return recommendationsList;
}

// Función para parsear fechas en formato "Mes Año" (ej. "Feb 2022")
function parseDate(dateString) {
    const [month, year] = dateString.split(' ');
    const monthIndex = new Date(Date.parse(month + " 1, 2020")).getMonth();
    return new Date(year, monthIndex);
}

// Función para parsear solo años
function parseYear(yearString) {
    return new Date(yearString, 0);
}

// Ejecutar la extracción al cargar el script
extractProfileData();
