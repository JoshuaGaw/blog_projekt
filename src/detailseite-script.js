// Detailseite Funktionen

// Löschen + Redirect auf Main-Page

const deleteButton = document.getElementById('detail-delete-button');
const deletePopup = document.getElementById('detail-delete-container');
const deleteCancelButton = document.getElementById('detail-delete-cancel');
const deleteConfirmButton = document.getElementById('detail-delete-confirm');

// Klick auf Löschen öffnet zunächst nur das Bestätigungsfenster
deleteButton.addEventListener('click', () => {
    deletePopup.classList.add('display-flex');
});

// Abbrechen schließt das Bestätigungsfenster ohne Löschen
deleteCancelButton.addEventListener('click', () => {
    deletePopup.classList.remove('display-flex');
});

// Erst nach Bestätigung wird tatsächlich gelöscht
deleteConfirmButton.addEventListener('click', () => {
    const formData = new FormData();
    formData.append('id', deleteConfirmButton.dataset.id);
    apiSend('DELETE', formData)
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

const saveButton = document.getElementById('detail-edit-submit');
const editImageError = document.getElementById('detail-edit-image-error');
const editTitleError = document.getElementById('detail-edit-title-error');

saveButton.addEventListener('click', () => {
    const title = document.getElementById('detail-edit-title').value;
    const description = document.getElementById('detail-edit-description').value;
    const content = document.getElementById('detail-edit-content').value;
    const postId = saveButton.dataset.id;
    const imageFile = document.getElementById('detail-edit-image').files[0];

    if (title.trim() === '') {
        showError(editTitleError, 'Ein Titel ist erforderlich.');
        document.getElementById('detail-edit-title').focus();
        return;
    }
    clearError(editTitleError);

    if (imageFile) {
        const err = validateImageFile(imageFile);
        if (err) {
            showError(editImageError, err);
            return;
        }
    }
    clearError(editImageError);

    const formData = new FormData();
    formData.append('id', postId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', content);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    apiSend('PUT', formData)
        .then(({ ok, data }) => {
            if (!ok || data.success === false) {
                showError(editImageError, data.error || 'Speichern fehlgeschlagen.');
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
            showError(editImageError, err);
            editImageInput.value = '';
            editImagePreview.src = '';
            editImagePreview.classList.add('display-none');
            return;
        }
        clearError(editImageError);
        editImagePreview.src = URL.createObjectURL(file);
        editImagePreview.classList.remove('display-none');
    } else {
        clearError(editImageError);
        editImagePreview.src = '';
        editImagePreview.classList.add('display-none');
    }
});

// Abbrechen
const cancelButton = document.getElementById('new-post-cancel');
cancelButton.addEventListener('click', () => {
    clearError(editImageError);
    clearError(editTitleError);
    popup.classList.remove('display-flex');
    document.body.classList.remove('no-scroll');
})