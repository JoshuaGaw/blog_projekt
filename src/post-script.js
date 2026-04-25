const url = "http://localhost/BlogProjekt/src/posts.php";

// Detailseite Funktionen

// Löschen + Redirect auf Main-Page

const deleteButton = document.getElementById('detail-delete-button');

deleteButton.addEventListener('click', () => {
    console.log("delete clicked")
    const postId = deleteButton.getAttribute('data-id');
    fetch(url, {
        method: 'DELETE',
        body: `id=${postId}`
    })
        .then(response => response.json())
        .then(() => {
            window.location.href = 'index.html';
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
    const content = document.getElementById('detail-edit-content').value;
    const postId = saveButton.getAttribute('data-id');

    fetch(url, {
        method: 'PUT',
        body: new URLSearchParams({id: postId, title: title, content: content})
    })
        .then(response => response.json())
        .then(() => {
            popup.classList.remove('display-flex');
            location.reload();
        })
})