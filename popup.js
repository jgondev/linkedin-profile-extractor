// popup.js

// Get references to the DOM elements
const messageElement = document.getElementById('message');
const outputElement = document.getElementById('output');
const copyButton = document.getElementById('copyButton');

// Initially hide the output and copy button
outputElement.style.display = 'none';
copyButton.style.display = 'none';

function updatePopupBasedOnUrl(url) {
    if (!url.includes('linkedin.com/public-profile/settings')) {
        messageElement.innerHTML = 'Please navigate to <a href="#" id="goSettings" class="text-blue-500 hover:text-blue-700 cursor-pointer">the LinkedIn public profile settings page</a>.';
        document.getElementById('goSettings').addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.update(tabs[0].id, { url: 'https://www.linkedin.com/public-profile/settings' });
            });
        });
    } else {
        // If we are already on the correct page, try to extract data automatically
        extractDataAutomatically();
    }
}

// Listen for background messages for URL changes
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "URL_CHANGE") {
        updatePopupBasedOnUrl(message.url);
    }
});

// Check the current URL of the active tab when the popup is opened
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    updatePopupBasedOnUrl(tabs[0].url);
});

function extractDataAutomatically() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        }).catch((error) => {
            //console.error('Error injecting the content script:', error);
        });
    });
}

// Listener to receive messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'profileData') {
        const profileData = request.data;
        outputElement.textContent = JSON.stringify(profileData, null, 2);
        outputElement.style.display = 'block'; // Show the text box with the data
        copyButton.style.display = 'inline-block'; // Show the copy button only when there is data
        messageElement.style.display = 'none'; // Hide the instructions message
    }
});

// Listener for the copy to clipboard button
copyButton.addEventListener('click', () => {
    const textToCopy = outputElement.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Data copied to clipboard.');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
    });
});
