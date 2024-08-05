// background.js

// Escuchar cuando el ícono de la extensión es clickeado
chrome.action.onClicked.addListener((tab) => {
    // Solo inyecta el script de contenido si la URL es correcta
    if (tab.url.includes('linkedin.com/public-profile/settings')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).catch((error) => {
            console.error('Error al inyectar el script de contenido:', error);
        });
    }
});

// Escuchar los cambios en las pestañas para detectar cambios de URL
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Verifica si la información del cambio incluye una URL
    if (changeInfo.url) {
        // Envía un mensaje al popup si está abierto
        chrome.runtime.sendMessage({ type: "URL_CHANGE", url: changeInfo.url, tabId: tabId }).catch((error) => {
            console.warn('No se pudo enviar el mensaje, posiblemente el popup no está abierto:', error);
        });
    }
});
