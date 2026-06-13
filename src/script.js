// Funktionen, die beim Aufruf des Browsers sofort ausgeführt werden sollen

document.addEventListener('DOMContentLoaded', () => {
    // Wird ausgeführt, sobald das HTML fertig geladen ist
    getCards();

    // Suche
    const searchInput = document.getElementById('search-input');
    let searchTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query === '') {
                getCards();
            } else {
                searchCards(query);
            }
        }, 300);
    });
});


// Dark Mode
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Schauen, was der User für ein Theme gespeichert hat
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


// Header Funktionen

// Klick auf Titel der Seite -> Main-Page
const pageTitle = document.getElementById('headername');
pageTitle.addEventListener('click', () => {
    globalThis.location.href = 'index.html';
});

// Karten Funktionen

// Karten aus der DB holen, Karten erstellen, Kartendetails anzeigen

const url = "posts.php";
const postsContainer = document.getElementById('posts-container');
const heroContainer = document.getElementById('hero-container');

function getCards() {
    postsContainer.innerHTML = '';
    heroContainer.innerHTML = '';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) return;
            const firstElement = data[0];
            const card = document.createElement('div');
            card.classList.add('hero-card');
            card.dataset.id = firstElement.id;
            card.innerHTML = `
                <div class="hero-body">
                <h2>${firstElement.title}</h2>
                <p>${firstElement.description}</p>
                </div>
            `;
            heroContainer.appendChild(card);
            card.addEventListener('click', () => {
                globalThis.location.href = `post.php?id=${firstElement.id}`;
            });

            data.slice(1).forEach(post => {
                const card = document.createElement('div');
                card.classList.add('card1', 'squircle-corners');
                card.dataset.id = post.id;
                card.innerHTML = `
            <div class="card-body">
            <h2>${post.title}</h2>
            <p>${post.description}</p>
            </div>
        `;
                postsContainer.appendChild(card);
            })

            const cards = document.querySelectorAll('.card1');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const postId = card.dataset.id;
                    globalThis.location.href = `post.php?id=${postId}`;
                });
            });
        });
}


function searchCards(query) {
    postsContainer.innerHTML = '';
    heroContainer.innerHTML = '';
    fetch(`${url}?search=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                postsContainer.innerHTML = `<p class="search-no-results">Keine Ergebnisse für „${query}".</p>`;
                return;
            }
            data.forEach(post => {
                const card = document.createElement('div');
                card.classList.add('card1', 'squircle-corners');
                card.dataset.id = post.id;
                card.innerHTML = `
                    <div class="card-body">
                    <h2>${post.title}</h2>
                    <p>${post.description}</p>
                    </div>
                `;
                postsContainer.appendChild(card);
                card.addEventListener('click', () => {
                    globalThis.location.href = `post.php?id=${post.id}`;
                });
            });
        });
}

// Pop-up-Funktionen

// Popup anzeigen

const popup = document.getElementById('new-post-container');
const openPopupButton = document.getElementById('new-post-button');

openPopupButton.addEventListener('click', () => {
    popup.classList.toggle('display-flex');
    document.body.classList.toggle('no-scroll', popup.classList.contains('display-flex'));
});

// Pop-up-Eintrag speichern

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

const saveButton = document.getElementById('new-post-submit');
const imageError = document.getElementById('new-post-image-error');
const titleError = document.getElementById('new-post-title-error');

function showImageError(msg) {
    imageError.textContent = msg;
    imageError.style.display = 'block';
}

function clearImageError() {
    imageError.textContent = '';
    imageError.style.display = 'none';
}

function showTitleError(msg) {
    titleError.textContent = msg;
    titleError.style.display = 'block';
}

function clearTitleError() {
    titleError.textContent = '';
    titleError.style.display = 'none';
}

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

saveButton.addEventListener('click', () => {
    const title = document.getElementById('new-post-title').value;
    const description = document.getElementById('new-post-description').value;
    const content = document.getElementById('new-post-content').value;
    const imageFile = document.getElementById('new-post-image').files[0];

    if (title.trim() === '') {
        showTitleError('Ein Titel ist erforderlich.');
        document.getElementById('new-post-title').focus();
        return;
    }
    clearTitleError();

    if (imageFile) {
        const err = validateImageFile(imageFile);
        if (err) {
            showImageError(err);
            return;
        }
    }
    clearImageError();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', content);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
            if (!ok || data.success === false) {
                showImageError(data.error || 'Speichern fehlgeschlagen.');
                return;
            }
            popup.classList.remove('display-flex');
            document.body.classList.remove('no-scroll');
            getCards();
        })
})

// Pop-up-Abbrechen
const cancelButton = document.getElementById('new-post-cancel');
const titelInput = document.getElementById('new-post-title');
const descriptionInput = document.getElementById('new-post-description');
const contentInput = document.getElementById('new-post-content');
const imageInput = document.getElementById('new-post-image');
const imagePreview = document.getElementById('new-post-image-preview');

// Bildvorschau
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (file) {
        const err = validateImageFile(file);
        if (err) {
            showImageError(err);
            imageInput.value = '';
            imagePreview.src = '';
            imagePreview.style.display = 'none';
            return;
        }
        clearImageError();
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
    } else {
        clearImageError();
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
});

cancelButton.addEventListener('click', () => {
    titelInput.value = '';
    descriptionInput.value = '';
    contentInput.value = '';
    imageInput.value = '';
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    clearImageError();
    clearTitleError();
    popup.classList.remove('display-flex');
    document.body.classList.remove('no-scroll');
})
