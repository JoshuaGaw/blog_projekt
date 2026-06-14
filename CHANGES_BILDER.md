# Dokumentation: Bild-Feature – Implementierung

## Übersicht

Es wurden alle notwendigen Änderungen vorgenommen, um Bilder zu Blog-Posts hinzufügen, anzeigen, aktualisieren und gemeinsam mit Posts löschen zu können.

---

## 1. Datenbank

### Neue Tabelle: `images`

Die bestehende `images`-Tabelle (aus `images.sql`) wurde in die Datenbank `blog` importiert:

```sql
CREATE TABLE `images` (
  `id`          int(11)      NOT NULL AUTO_INCREMENT,
  `post_id`     int(50)      NOT NULL,
  `file_path`   varchar(100) NOT NULL,
  `is_cover`    tinyint(1)   NOT NULL,
  `uploaded_at` datetime     NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
);
```

- `post_id` → Fremdschlüssel zur `posts`-Tabelle
- `file_path` → relativer Pfad zur gespeicherten Bilddatei, z. B. `uploads/img_abc123.jpg`
- `is_cover` → `1` = Cover-Bild der Karte, `0` = weiteres Bild (für spätere Verwendung)
- `uploaded_at` → Zeitstempel des Uploads

### Entfernte Spalte

Eine zuvor testweise hinzugefügte Spalte `image_url` in der `posts`-Tabelle wurde wieder entfernt:

```sql
ALTER TABLE blog.posts DROP COLUMN IF EXISTS image_url;
```

---

## 2. Neuer Ordner: `src/uploads/`

```bash
mkdir -p /Applications/XAMPP/xamppfiles/htdocs/blog_projekt/src/uploads
chmod 777 /Applications/XAMPP/xamppfiles/htdocs/blog_projekt/src/uploads
```

> **Wichtig:** `chmod 777` ist notwendig, weil Apache unter XAMPP als `daemon`-User läuft und sonst keine Schreibrechte auf den Ordner hat. `move_uploaded_file()` schlägt ohne diese Rechte lautlos fehl.

Hochgeladene Bilder werden hier abgelegt und sind über folgende URL erreichbar:
```
http://localhost/Blog_Projekt/src/uploads/<dateiname>
```

---

## 3. `src/posts.php` – Backend-API

### GET – Posts mit Cover-Bild laden

Die `SELECT`-Abfrage wurde um einen `LEFT JOIN` auf die `images`-Tabelle erweitert, sodass das Cover-Bild direkt mit geliefert wird:

```php
$result = mysqli_query($conn,
    "SELECT p.*, i.file_path AS cover_image
     FROM posts p
     LEFT JOIN images i ON i.post_id = p.id AND i.is_cover = 1
     ORDER BY p.created_at DESC"
);
```

Das Ergebnis enthält nun ein Feld `cover_image` (z. B. `uploads/img_abc.jpg`) oder `null` wenn kein Bild vorhanden ist.

---

### POST – Neuen Post mit Bild speichern

Nach dem Einfügen des Posts wird geprüft, ob eine Datei hochgeladen wurde:

```php
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (in_array(strtolower($ext), $allowed)) {
        $filename = uniqid('img_', true) . '.' . $ext;
        $uploadDir = __DIR__ . '/uploads/';
        if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
            $filePath = 'uploads/' . $filename;
            $imgStmt = mysqli_prepare($conn,
                "INSERT INTO images (post_id, file_path, is_cover, uploaded_at) VALUES (?, ?, 1, NOW())"
            );
            mysqli_stmt_bind_param($imgStmt, "is", $newId, $filePath);
            mysqli_stmt_execute($imgStmt);
        }
    }
}
```

- Nur Dateien mit erlaubten Endungen (`jpg`, `jpeg`, `png`, `gif`, `webp`) werden akzeptiert
- Der Dateiname wird mit `uniqid()` eindeutig generiert, um Kollisionen zu vermeiden
- Der Pfad wird in der `images`-Tabelle mit `is_cover = 1` gespeichert

---

### POST mit `_method=PUT` – Post bearbeiten mit neuem Bild

Da Browser über `FormData` (für Datei-Uploads) kein echtes `PUT` unterstützen, wird ein `POST`-Request mit dem zusätzlichen Feld `_method=PUT` gesendet. Das Backend erkennt dies:

```php
} elseif ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
```

Wenn ein neues Bild hochgeladen wird, wird das alte Cover-Bild gelöscht und durch das neue ersetzt:

```php
// Altes Cover-Bild aus images-Tabelle entfernen
$delStmt = mysqli_prepare($conn, "DELETE FROM images WHERE post_id = ? AND is_cover = 1");
mysqli_stmt_bind_param($delStmt, "i", $id);
mysqli_stmt_execute($delStmt);

// Neues Bild einfügen
$imgStmt = mysqli_prepare($conn,
    "INSERT INTO images (post_id, file_path, is_cover, uploaded_at) VALUES (?, ?, 1, NOW())"
);
mysqli_stmt_bind_param($imgStmt, "is", $id, $filePath);
mysqli_stmt_execute($imgStmt);
```

Wird kein neues Bild hochgeladen, bleibt das bestehende Bild unverändert.

---

### DELETE – Post und Bilder löschen

Da `images` einen Foreign-Key-Constraint auf `posts` hat, müssen zuerst die Bild-Einträge gelöscht werden, bevor der Post gelöscht werden kann:

```php
$delImg = mysqli_prepare($conn, "DELETE FROM images WHERE post_id = ?");
mysqli_stmt_bind_param($delImg, "i", $id);
mysqli_stmt_execute($delImg);

$stmt = mysqli_prepare($conn, "DELETE FROM posts WHERE id = ?");
```

---

## 4. `src/post.php` – Detailseite

### SQL-Abfrage mit JOIN

Auch hier wurde die Abfrage um einen `LEFT JOIN` erweitert:

```php
$stmt = mysqli_prepare($conn,
    "SELECT p.*, i.file_path AS cover_image
     FROM posts p
     LEFT JOIN images i ON i.post_id = p.id AND i.is_cover = 1
     WHERE p.id = ?"
);
```

### Bild in der Detailansicht anzeigen

Das Cover-Bild wird oberhalb des Titels angezeigt, sofern eines vorhanden ist:

```php
<?php if (!empty($post['cover_image'])): ?>
    <img class="detail-hero-image"
         src="<?php echo htmlspecialchars($post['cover_image']); ?>"
         alt="<?php echo htmlspecialchars($post['title']); ?>">
<?php endif; ?>
```

### Bild-Upload im Bearbeiten-Popup

Im Bearbeiten-Formular wurde ein Datei-Upload-Feld ergänzt:

```html
<div class="display-flex-column padding-10">
    <label class="label" for="detail-edit-image">Bild ändern</label>
    <input type="file" id="detail-edit-image" class="input-field" accept="image/*">
    <img id="detail-edit-image-preview" src="" alt="Vorschau"
         style="display:none; margin-top:8px; max-height:150px; border-radius:8px; object-fit:cover;">
</div>
```

---

## 5. `src/index.html` – Hauptseite

Im „Neuer Eintrag"-Popup wurde ein Datei-Upload-Feld mit Live-Vorschau ergänzt:

```html
<div class="display-flex-column padding-10">
    <label class="label" for="new-post-image">Bild</label>
    <input class="input-field" type="file" id="new-post-image" accept="image/*">
    <img id="new-post-image-preview" src="" alt="Vorschau"
         style="display:none; margin-top:8px; max-height:150px; border-radius:8px; object-fit:cover;">
</div>
```

---

## 6. `src/startseite-script.js` – Hauptseite JavaScript

### Bild beim Erstellen mitsenden

Der `saveButton`-Handler wurde von `URLSearchParams` auf `FormData` umgestellt, damit Datei-Uploads möglich sind:

```js
const imageFile = document.getElementById('new-post-image').files[0];
const formData = new FormData();
formData.append('title', title);
formData.append('description', description);
formData.append('content', content);
if (imageFile) {
    formData.append('image', imageFile);
}
fetch(url, { method: 'POST', body: formData });
```

### Bilder in Karten anzeigen

**Hero-Karte** (erster Post):
```js
const heroImgHtml = firstElement.cover_image
    ? `<div class="hero-image-wrapper">
           <img class="hero-image" src="${firstElement.cover_image}" alt="${firstElement.title}">
       </div>`
    : `<div class="hero-image-wrapper hero-image-placeholder"></div>`;
```

**Normale Karten** (alle weiteren Posts):
```js
const imgHtml = post.cover_image
    ? `<img class="card-image" src="${post.cover_image}" alt="${post.title}">`
    : `<div class="card-image card-image-placeholder"></div>`;
```

### Live-Bildvorschau im Popup

```js
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
```

### Bildvorschau beim Abbrechen zurücksetzen

```js
imageInput.value = '';
imagePreview.src = '';
imagePreview.style.display = 'none';
```

---

## 7. `src/detailseite-startseite-script.js` – Detailseite JavaScript

### Bild beim Bearbeiten mitsenden

Der `saveButton`-Handler verwendet `FormData` mit `_method=PUT`:

```js
const formData = new FormData();
formData.append('_method', 'PUT');
formData.append('id', postId);
formData.append('title', title);
formData.append('description', description);
formData.append('content', content);
if (imageFile) {
    formData.append('image', imageFile);
}
fetch(url, { method: 'POST', body: formData });
```

### Live-Bildvorschau im Bearbeiten-Popup

```js
editImageInput.addEventListener('change', () => {
    const file = editImageInput.files[0];
    if (file) {
        editImagePreview.src = URL.createObjectURL(file);
        editImagePreview.style.display = 'block';
    }
});
```

---

## 8. `src/style.css` – Styling

### Karten-Bild (normale Karte)

```css
.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

.card-image-placeholder {
    background-color: #d1d5db;
}
```

### Hero-Karten-Bild

Das Bild ist in einen Wrapper-`div` eingebettet, damit `object-fit: cover` zuverlässig funktioniert:

```css
.hero-image-wrapper {
    width: 60%;
    flex-shrink: 0;
    overflow: hidden;
}

.hero-image {
    width: 100%;
    height: 380px;   /* gleiche Höhe wie .hero-card */
    object-fit: cover;
    object-position: center;
    display: block;
}

.hero-image-placeholder {
    background-color: #d1d5db;
}
```

### Detail-Seiten-Bild

```css
.detail-hero-image {
    width: 83.333333%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 12px;
    margin-top: 20px;
    margin-bottom: 10px;
    display: block;
}
```

### Responsive Anpassungen (Media Queries)

**Tablet (max-width: 900px):**
```css
.hero-image-wrapper { width: 100%; }
.hero-image         { width: 100%; height: 220px; }
```

**Smartphone (max-width: 600px):**
```css
.hero-image-wrapper { width: 100%; }
.hero-image         { width: 100%; height: 160px; }
```

---

## Zusammenfassung aller geänderten Dateien

| Datei | Art der Änderung |
|---|---|
| `Datenbank blog` | Neue Tabelle `images` importiert |
| `src/uploads/` | Neuer Ordner erstellt, Schreibrechte gesetzt (`chmod 777`) |
| `src/posts.php` | GET mit JOIN, POST/PUT mit Bild-Upload, DELETE mit Bilder-Vorlöschung |
| `src/post.php` | GET mit JOIN, Bild in Detailansicht, Upload-Feld im Edit-Popup |
| `src/index.html` | Upload-Feld mit Vorschau im „Neuer Eintrag"-Popup |
| `src/startseite-script.js` | FormData statt URLSearchParams, Bilder in Karten rendern, Vorschau-Logik |
| `src/detailseite-startseite-script.js` | FormData mit `_method=PUT`, Vorschau-Logik im Edit-Popup |
| `src/style.css` | Neue Klassen: `.card-image`, `.hero-image-wrapper`, `.hero-image`, `.detail-hero-image`, Placeholder-Styles, Media Queries |

