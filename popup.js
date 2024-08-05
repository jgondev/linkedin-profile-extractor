// popup.js

// Obtener referencias a los elementos del DOM
const messageElement = document.getElementById('message');
const outputElement = document.getElementById('output');
const copyButton = document.getElementById('copyButton');

// Inicialmente ocultar el output y el botón de copia
outputElement.style.display = 'none';
copyButton.style.display = 'none';

function updatePopupBasedOnUrl(url) {
    if (!url.includes('linkedin.com/public-profile/settings')) {
        messageElement.innerHTML = 'Por favor, navega a <a href="#" id="goSettings" class="text-blue-500 hover:text-blue-700 cursor-pointer">la página de configuración de perfil público de LinkedIn</a>.';
        document.getElementById('goSettings').addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.update(tabs[0].id, { url: 'https://www.linkedin.com/public-profile/settings' });
            });
        });
    } else {
        // Si ya estamos en la página correcta, intentar extraer datos automáticamente
        extractDataAutomatically();
    }
}

// Escuchar mensajes de fondo para cambios de URL
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === "URL_CHANGE") {
        updatePopupBasedOnUrl(message.url);
    }
});

// Verificar la URL actual de la pestaña activa cuando se abre el popup
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    updatePopupBasedOnUrl(tabs[0].url);
});

function extractDataAutomatically() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        }).catch((error) => {
            //console.error('Error al inyectar el script de contenido:', error);
        });
    });
}

// Listener para recibir mensajes desde el content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'profileData') {
        const profileData = request.data;
        outputElement.textContent = JSON.stringify(profileData, null, 2);
        outputElement.style.display = 'block'; // Mostrar el cuadro de texto con los datos
        copyButton.style.display = 'inline-block'; // Mostrar el botón de copia solo cuando hay datos
        messageElement.style.display = 'none'; // Ocultar el mensaje de instrucciones
    }
});

// Listener para el botón de copiar al portapapeles
copyButton.addEventListener('click', () => {
    const textToCopy = outputElement.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Datos copiados al portapapeles.');
    }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
    });
});
