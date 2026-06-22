// Gemeinsame Helfer für index.html und detailseite.php
// Muss vor startseite-script.js bzw. detailseite-startseite-script.js eingebunden werden.

// API-Endpoint
const API_URL = "server-controller.php";

// Bild-Validierung
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

function getFileExtension(file) {
    const name = file.name || '';
    const dot = name.lastIndexOf('.');
    if (dot === -1) return '';
    return name.slice(dot + 1).toLowerCase();
}

function validateImageFile(file) {
    const ext = getFileExtension(file);
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
        return 'Ungültiges Bildformat. Erlaubt: ' + ALLOWED_IMAGE_EXTENSIONS.join(', ') + '.';
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return 'Die Datei ist zu groß. Maximal 5 MB sind erlaubt.';
    }
    return null;
}

// Generische Fehleranzeige
function showError(el, msg) {
    el.textContent = msg;
    el.classList.remove('display-none');
}

function clearError(el) {
    el.textContent = '';
    el.classList.add('display-none');
}

// API-Aufruf: tarnt PUT/DELETE als POST mit _method,
// damit FormData (multipart) korrekt vom PHP-Server gelesen wird.
function apiSend(method, formData) {
    if (method !== 'GET' && method !== 'POST' && formData instanceof FormData) {
        formData.append('_method', method);
        method = 'POST';
    }
    return fetch(API_URL, { method, body: formData })
        .then(response => response.json().then(data => ({ ok: response.ok, data })));
}

// Dark Mode
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    toggleButton.textContent = '🌙';
} else {
    toggleButton.textContent = '☀️';
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        toggleButton.textContent = '🌙';
    } else {
        localStorage.setItem('theme', 'light');
        toggleButton.textContent = '☀️';
    }
});

// Header: Klick auf Titel -> Startseite
const pageTitle = document.getElementById('headername');
pageTitle.addEventListener('click', () => {
    globalThis.location.href = 'index.html';
});
