// Setup beim Laden: Karten holen + Suche initialisieren

document.addEventListener('DOMContentLoaded', () => {
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


// Karten Funktionen

// Karten aus der DB holen, Karten erstellen, Kartendetails anzeigen

const postsContainer = document.getElementById('posts-container');
const heroContainer = document.getElementById('hero-container');

function getCards() {
    postsContainer.innerHTML = '';
    heroContainer.innerHTML = '';
    fetch(API_URL)
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
                globalThis.location.href = `detailseite.php?id=${firstElement.id}`;
            });

            data.slice(1).forEach(post => {
                const card = document.createElement('div');
                card.classList.add('card1');
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
                    globalThis.location.href = `detailseite.php?id=${postId}`;
                });
            });
        });
}


function searchCards(query) {
    postsContainer.innerHTML = '';
    heroContainer.innerHTML = '';
    fetch(`${API_URL}?search=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                postsContainer.innerHTML = `<p class="search-no-results">Keine Ergebnisse für „${query}".</p>`;
                return;
            }
            data.forEach(post => {
                const card = document.createElement('div');
                card.classList.add('card1');
                card.dataset.id = post.id;
                card.innerHTML = `
                    <div class="card-body">
                    <h2>${post.title}</h2>
                    <p>${post.description}</p>
                    </div>
                `;
                postsContainer.appendChild(card);
                card.addEventListener('click', () => {
                    globalThis.location.href = `detailseite.php?id=${post.id}`;
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

const saveButton = document.getElementById('new-post-submit');
const imageError = document.getElementById('new-post-image-error');
const titleError = document.getElementById('new-post-title-error');

saveButton.addEventListener('click', () => {
    const title = document.getElementById('new-post-title').value;
    const description = document.getElementById('new-post-description').value;
    const content = document.getElementById('new-post-content').value;
    const imageFile = document.getElementById('new-post-image').files[0];

    if (title.trim() === '') {
        showError(titleError, 'Ein Titel ist erforderlich.');
        document.getElementById('new-post-title').focus();
        return;
    }
    clearError(titleError);

    if (imageFile) {
        const err = validateImageFile(imageFile);
        if (err) {
            showError(imageError, err);
            return;
        }
    }
    clearError(imageError);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', content);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    apiSend('POST', formData)
        .then(({ ok, data }) => {
            if (!ok || data.success === false) {
                showError(imageError, data.error || 'Speichern fehlgeschlagen.');
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
            showError(imageError, err);
            imageInput.value = '';
            imagePreview.src = '';
            imagePreview.style.display = 'none';
            return;
        }
        clearError(imageError);
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
    } else {
        clearError(imageError);
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
    clearError(imageError);
    clearError(titleError);
    popup.classList.remove('display-flex');
    document.body.classList.remove('no-scroll');
})
