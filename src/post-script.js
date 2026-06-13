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
    document.body.classList.add('no-scroll');
})

// Post bearbeiten

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

const saveButton = document.getElementById('detail-edit-submit');
const editImageError = document.getElementById('detail-edit-image-error');
const editTitleError = document.getElementById('detail-edit-title-error');

function showEditImageError(msg) {
    editImageError.textContent = msg;
    editImageError.style.display = 'block';
}

function clearEditImageError() {
    editImageError.textContent = '';
    editImageError.style.display = 'none';
}

function showEditTitleError(msg) {
    editTitleError.textContent = msg;
    editTitleError.style.display = 'block';
}

function clearEditTitleError() {
    editTitleError.textContent = '';
    editTitleError.style.display = 'none';
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
    const title = document.getElementById('detail-edit-title').value;
    const description = document.getElementById('detail-edit-description').value;
    const content = document.getElementById('detail-edit-content').value;
    const postId = saveButton.dataset.id;
    const imageFile = document.getElementById('detail-edit-image').files[0];

    if (title.trim() === '') {
        showEditTitleError('Ein Titel ist erforderlich.');
        document.getElementById('detail-edit-title').focus();
        return;
    }
    clearEditTitleError();

    if (imageFile) {
        const err = validateImageFile(imageFile);
        if (err) {
            showEditImageError(err);
            return;
        }
    }
    clearEditImageError();

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
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
            if (!ok || data.success === false) {
                showEditImageError(data.error || 'Speichern fehlgeschlagen.');
                return;
            }
            popup.classList.remove('display-flex');
            document.body.classList.remove('no-scroll');
            location.reload();
        })
})

// Bildvorschau im Bearbeiten-Popup
const editImageInput = document.getElementById('detail-edit-image');
const editImagePreview = document.getElementById('detail-edit-image-preview');
editImageInput.addEventListener('change', () => {
    const file = editImageInput.files[0];
    if (file) {
        const err = validateImageFile(file);
        if (err) {
            showEditImageError(err);
            editImageInput.value = '';
            editImagePreview.src = '';
            editImagePreview.style.display = 'none';
            return;
        }
        clearEditImageError();
        editImagePreview.src = URL.createObjectURL(file);
        editImagePreview.style.display = 'block';
    } else {
        clearEditImageError();
        editImagePreview.src = '';
        editImagePreview.style.display = 'none';
    }
});

// Abbrechen
const cancelButton = document.getElementById('new-post-cancel');
cancelButton.addEventListener('click', () => {
    clearEditImageError();
    clearEditTitleError();
    popup.classList.remove('display-flex');
    document.body.classList.remove('no-scroll');
})