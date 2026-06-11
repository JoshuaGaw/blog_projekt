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
    popup.classList.add('display-flex');
});

// Pop-up-Eintrag speichern

const saveButton = document.getElementById('new-post-submit');

saveButton.addEventListener('click', () => {
    const title = document.getElementById('new-post-title').value;
    const description = document.getElementById('new-post-description').value;
    const content = document.getElementById('new-post-content').value;
    const imageFile = document.getElementById('new-post-image').files[0];
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
        .then(response => response.json())
        .then(() => {
            popup.classList.remove('display-flex');
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
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
    } else {
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
    popup.classList.remove('display-flex');
})
