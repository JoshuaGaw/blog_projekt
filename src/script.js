// Dark Mode

const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const card1 = document.getElementById('card1');

// Schauen was der User für ein Theme gespeichert hat
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

// Karten aus der DB holen

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
            heroContainer.innerHTML = `
                <h2>${firstElement.title}</h2>
                <p>${firstElement.content}</p>
            `;
            data.slice(1).forEach(post => {
                const card = document.createElement('div');
                card.classList.add('card1');
                card.classList.add('squircle-corners')
                card.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
        `;
                postsContainer.appendChild(card);
            })
        });
}

// Popup Funktionen

// Popup anzeigen

const popup = document.getElementById('new-post-container');
const openPopupButton = document.getElementById('new-post-button');

openPopupButton.addEventListener('click', () => {
    popup.classList.add('display-flex');
});

// Eintrag speichern

const saveButton = document.getElementById('new-post-submit');

saveButton.addEventListener('click', () => {
    console.log('Speichern gedrückt')
    const title = document.getElementById('new-post-title').value;
    const content = document.getElementById('new-post-content').value;
    const formData = new FormData();
    formData.append('title', title);
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
