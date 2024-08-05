// background.js

// Listen for when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    // Only inject the content script if the URL is correct
    if (tab.url.includes('linkedin.com/public-profile/settings')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).catch((error) => {
            console.error('Error injecting the content script:', error);
        });
    }
});

// Listen for tab updates to detect URL changes
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Check if the change info includes a URL
    if (changeInfo.url) {
        // Send a message to the popup if it is open
        chrome.runtime.sendMessage({ type: "URL_CHANGE", url: changeInfo.url, tabId: tabId }).catch((error) => {
            console.warn('Could not send the message, possibly the popup is not open:', error);
        });
    }
});
