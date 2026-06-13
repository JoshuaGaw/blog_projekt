const url = "posts.php";

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

    // Save preference
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


// Detailseite Funktionen

// Löschen + Redirect auf Main-Page

const deleteButton = document.getElementById('detail-delete-button');

deleteButton.addEventListener('click', () => {
    console.log("delete clicked")
    const postId = deleteButton.dataset.id;
    fetch(url, {
        method: 'DELETE',
        body: `id=${postId}`
    })
        .then(response => response.json())
        .then(() => {
            globalThis.location.href = 'index.html';
        })
})

// Bearbeiten + Seite neu laden

// Popup anzeigen

const editButton = document.getElementById('detail-edit-button');
const popup = document.getElementById('detail-edit-container');

editButton.addEventListener('click', () => {
    popup.classList.add('display-flex');
})

// Post bearbeiten

const saveButton = document.getElementById('detail-edit-submit');

saveButton.addEventListener('click', () => {
    const title = document.getElementById('detail-edit-title').value;
    const description = document.getElementById('detail-edit-description').value;
    const content = document.getElementById('detail-edit-content').value;
    const postId = saveButton.dataset.id;
    const imageFile = document.getElementById('detail-edit-image').files[0];

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('id', postId);
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
            location.reload();
        })
})

// Bildvorschau im Bearbeiten-Popup
const editImageInput = document.getElementById('detail-edit-image');
const editImagePreview = document.getElementById('detail-edit-image-preview');
editImageInput.addEventListener('change', () => {
    const file = editImageInput.files[0];
    if (file) {
        editImagePreview.src = URL.createObjectURL(file);
        editImagePreview.style.display = 'block';
    } else {
        editImagePreview.src = '';
        editImagePreview.style.display = 'none';
    }
});

// Abbrechen
const cancelButton = document.getElementById('new-post-cancel');
cancelButton.addEventListener('click', () => {
    popup.classList.remove('display-flex');
})