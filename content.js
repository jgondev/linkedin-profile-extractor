// content.js

// Function to extract LinkedIn profile data
function extractProfileData() {
    const profileData = {
        // General information
        name: document.querySelector('.top-card-layout__title')?.innerText.trim() || 'Name not found',
        headline: document.querySelector('.top-card-layout__headline')?.innerText.trim() || 'Headline not found',
        location: document.querySelector('.top-card__subline-item')?.innerText.trim() || 'Location not found',
        followers: document.querySelector('.top-card__subline-item:nth-child(2)')?.innerText.trim() || 'Followers not found',
        connections: document.querySelector('.top-card__subline-item--bullet')?.innerText.trim() || 'Connections not found',

        // Current and past positions
        currentPositions: Array.from(document.querySelectorAll('[data-section="currentPositionsDetails"] .top-card-link__description')).map(el => el.innerText.trim()),
        pastPositions: Array.from(document.querySelectorAll('[data-section="pastPositionsDetails"] .top-card-link__description')).map(el => el.innerText.trim()),

        // Education, experience, certifications, projects, test scores, languages, and recommendations
        education: extractEducationData(),
        experiences: extractExperienceData(),
        certifications: extractCertificationsData(),
        projects: extractProjectsData(),
        scores: extractScoresData(),
        languages: extractLanguagesData(),
        recommendations: extractRecommendationsData()
    };

    // Send the data to the popup
    try {
        chrome.runtime.sendMessage({ action: 'profileData', data: profileData }, (response) => {
            if (chrome.runtime.lastError) {
                // You can handle the error here without showing it in the console
                // For example, you can show an alert or simply ignore the error
            } else {
            }
        });
    } catch (error) {
    }
}

// Function to extract education
function extractEducationData() {
    const educationList = [];
    const educationItems = document.querySelectorAll('.education__list-item');
    educationItems.forEach((item) => {
        const universityElement = item.querySelector('.profile-section-card__title-link');
        const degreeElement = item.querySelector('.education__item--degree-info');
        const dateElement = item.querySelector('.education__item--duration .date-range');

        const university = universityElement ? universityElement.innerText.trim() : 'University not found';
        const degree = degreeElement ? degreeElement.innerText.trim() : 'Degree not found';

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

// Function to extract experience
function extractExperienceData() {
    const experiences = [];
    const experienceItems = document.querySelectorAll('.experience-item');
    experienceItems.forEach((item) => {
        const titleElement = item.querySelector('.profile-section-card__title');
        const companyElement = item.querySelector('.profile-section-card__subtitle a');
        const dateElement = item.querySelector('.experience-item__duration .date-range');
        const locationElement = item.querySelector('.experience-item__location');

        const title = titleElement ? titleElement.innerText.trim() : 'Title not found';
        const company = companyElement ? companyElement.innerText.trim() : 'Company not found';
        const location = locationElement ? locationElement.innerText.trim() : 'Location not found';

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

// Function to extract certifications
function extractCertificationsData() {
    const certificationsList = [];
    const certificationItems = document.querySelectorAll('.certifications__list .profile-section-card');
    certificationItems.forEach((item) => {
        const titleElement = item.querySelector('.profile-section-card__title');
        const issuerElement = item.querySelector('.profile-section-card__subtitle a');
        const dateElement = item.querySelector('.certifications__start-date time');

        const title = titleElement ? titleElement.innerText.trim() : 'Certification not found';
        const issuer = issuerElement ? issuerElement.innerText.trim() : 'Issuer not found';
        const issueDate = dateElement ? parseDate(dateElement.innerText.trim()) : null;

        certificationsList.push({ title, issuer, issueDate });
    });
    return certificationsList;
}

// Function to extract projects
function extractProjectsData() {
    const projectsList = [];
    const projectItems = document.querySelectorAll('.projects__list .profile-section-card');
    projectItems.forEach((item) => {
        const titleElement = item.querySelector('h3');
        const dateElement = item.querySelector('.date-range time');
        const collaboratorsElements = item.querySelectorAll('.face-pile__url');

        const title = titleElement ? titleElement.innerText.trim() : 'Project not found';
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

// Function to extract test scores
function extractScoresData() {
    const scoresList = [];
    const scoreItems = document.querySelectorAll('.scores__list .profile-section-card');
    scoreItems.forEach((item) => {
        const titleElement = item.querySelector('.profile-section-card__title');
        const scoreElement = item.querySelector('.profile-section-card__subtitle');
        const dateElement = item.querySelector('.date-range time');

        const title = titleElement ? titleElement.innerText.trim() : 'Test not found';
        const score = scoreElement ? scoreElement.innerText.trim() : 'Score not found';
        const date = dateElement ? parseDate(dateElement.innerText.trim()) : null;

        scoresList.push({ title, score, date });
    });
    return scoresList;
}

// Function to extract languages
function extractLanguagesData() {
    const languagesList = [];
    const languageItems = document.querySelectorAll('.languages__list .profile-section-card');
    languageItems.forEach((item) => {
        const languageElement = item.querySelector('.profile-section-card__title');
        const proficiencyElement = item.querySelector('.profile-section-card__subtitle');

        const language = languageElement ? languageElement.innerText.trim() : 'Language not found';
        const proficiency = proficiencyElement ? proficiencyElement.innerText.trim() : 'Proficiency not found';

        languagesList.push({ language, proficiency });
    });
    return languagesList;
}

// Function to extract recommendations
function extractRecommendationsData() {
    const recommendationsList = [];
    const recommendationItems = document.querySelectorAll('.recommendations__list-item');
    recommendationItems.forEach((item) => {
        const authorElement = item.querySelector('.base-main-card__title');
        const contentElement = item.querySelector('.endorsement-card__content');
        const profileLinkElement = item.querySelector('.endorsement-card a');

        const author = authorElement ? authorElement.innerText.trim() : 'Author not found';
        const content = contentElement ? contentElement.innerText.trim() : 'Content not found';
        const profileLink = profileLinkElement ? profileLinkElement.href : 'Profile link not found';

        recommendationsList.push({ author, content, profileLink });
    });
    return recommendationsList;
}

// Function to parse dates in "Month Year" format (e.g., "Feb 2022")
function parseDate(dateString) {
    const [month, year] = dateString.split(' ');
    const monthIndex = new Date(Date.parse(month + " 1, 2020")).getMonth();
    return new Date(year, monthIndex);
}

// Function to parse years only
function parseYear(yearString) {
    return new Date(yearString, 0);
}

// Execute extraction when the script loads
extractProfileData();
