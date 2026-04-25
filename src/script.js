// Funktionen, die beim Aufruf des Browsers sofort ausgeführt werden sollen

document.addEventListener('DOMContentLoaded', () => {
    // Wird ausgeführt, sobald das HTML fertig geladen ist
    getCards();
});


// Dark Mode

const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const card1 = document.getElementById('card1');

// Schauen, was der User für ein Theme gespeichert hat
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    card1.classList.add('dark-mode');
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    card1.classList.toggle('dark-mode');

    // Save preference
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});


// Karten Funktionen

// Karten aus der DB holen, Karten erstellen, Kartendetails anzeigen

const url = "http://localhost/BlogProjekt/src/posts.php";
const postsContainer = document.getElementById('posts-container');
const heroContainer = document.getElementById('hero-container');

function getCards() {
    postsContainer.innerHTML = '';
    heroContainer.innerHTML = '';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const firstElement = data[0];
            const card = document.createElement('div');
            card.classList.add('hero-card');
            card.setAttribute('data-id', firstElement.id);
            card.innerHTML = `
                <div class="hero-image"></div>
                <div class="hero-body">
                <h2>${firstElement.title}</h2>
                <p>${firstElement.description}</p>
                </div>
            `;
            heroContainer.appendChild(card);
            card.addEventListener('click', () => {
                window.location.href = `post.php?id=${firstElement.id}`;
            });

            data.slice(1).forEach(post => {
                const card = document.createElement('div');
                card.classList.add('card1');
                card.classList.add('squircle-corners');
                card.setAttribute('data-id', post.id);
                card.innerHTML = `
            <div class="card-image"></div>
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
                    const postId = card.getAttribute('data-id');
                    window.location.href = `post.php?id=${postId}`;
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

// Eintrag speichern

const saveButton = document.getElementById('new-post-submit');

saveButton.addEventListener('click', () => {
    const title = document.getElementById('new-post-title').value;
    const description = document.getElementById('new-post-description').value;
    const content = document.getElementById('new-post-content').value;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description)
    formData.append('content', content);

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
