<?php
include_once 'db.php';

// PHP Doc Kommentar, damit IDE weiß, dass die Variable schon initialisiert ist
/** @var mysqli $conn */

$id = $_GET['id'];
$stmt = mysqli_prepare($conn,
    "SELECT p.*, i.file_path AS cover_image
     FROM posts p
     LEFT JOIN images i ON i.post_id = p.id AND i.is_cover = 1
     WHERE p.id = ?"
);
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$post = mysqli_fetch_assoc($result);
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $post['title']; ?></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header class="header">
    <div class="header-content">
        <div id="headername">
            KÖLN ESSENMEILE
        </div>
        <div class="toggle-spacer"></div>
        <button id="theme-toggle" class="darkmode-toggle" title="Dark/Light Mode">☀️</button>
    </div>
</header>

<div id="detail-edit-container" class="display-none pop-up">
    <div class="pop-up-card">
        <div class="new-post-header-title">Post bearbeiten</div>
        <div class="pop-up-content">
            <div class="display-flex-column padding-10">
                <label class="label" for="detail-edit-title">Titel (max. 32 Zeichen)</label>
                <input type="text" id="detail-edit-title" class="input-field height-30" value="<?php echo $post['title']; ?>" maxlength="32" required>
                <div id="detail-edit-title-error" class="image-error" style="display:none;"></div>
            </div>
            <div class="display-flex-column padding-10">
                <label class="label" for="detail-edit-description">Beschreibung (max. 180 Zeichen)</label>
                <textarea id="detail-edit-description" class="input-field height-80" maxlength="180"><?php echo $post['description']; ?></textarea>
            </div>
            <div class="display-flex-column padding-10">
                <label class="label" for="detail-edit-content">Inhalt (max. 2000 Zeichen)</label>
                <textarea id="detail-edit-content" class="input-field height-200" maxlength="2000"><?php echo $post['content']; ?></textarea>
            </div>
            <div class="display-flex-column padding-10">
                <label class="label" for="detail-edit-image">Bild ändern (max. 5 MB)</label>
                <input type="file" id="detail-edit-image" class="input-field" accept="image/*">
                <div id="detail-edit-image-error" class="image-error" style="display:none;"></div>
                <img id="detail-edit-image-preview" src="" alt="Vorschau" style="display:none; margin-top:8px; max-height:150px; border-radius:8px; object-fit:cover;">
            </div>
        </div>
        <div class="pop-up-footer">
            <button id="new-post-cancel" class="button">Abbrechen</button>
            <button id="detail-edit-submit" class="button" data-id="<?php echo $post['id']; ?>">Speichern</button>
        </div>
    </div>
</div>

<div id="detail-delete-container" class="display-none pop-up">
    <div class="pop-up-card">
        <div class="new-post-header-title">Post löschen</div>
        <div class="pop-up-content">
            <div class="padding-10">
                Möchtest du diesen Post wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </div>
        </div>
        <div class="pop-up-footer">
            <button id="detail-delete-cancel" class="button">Abbrechen</button>
            <button id="detail-delete-confirm" class="button" data-id="<?php echo $post['id']; ?>">Löschen</button>
        </div>
    </div>
</div>

<main class="detail-main-container">
    <div class="detail-container">
        <?php if (!empty($post['cover_image'])): ?>
            <div class="detail-hero-frame">
                <img class="detail-hero-image" src="<?php echo htmlspecialchars($post['cover_image']); ?>" alt="<?php echo htmlspecialchars($post['title']); ?>">
            </div>
        <?php endif; ?>
        <h1 class="detail-title"><?php echo $post['title']; ?></h1>
        <?php if (!empty($post['created_at'])):
            $created = new DateTime($post['created_at']);
            $updated = new DateTime($post['updated_at']);
            $wasEdited = $updated > $created;
            $metaDate = ($wasEdited ? $updated : $created) -> format('d.m.Y \u\m H:i \U\h\r');
        ?>
            <div class="detail-meta">
                <?php echo $wasEdited ? 'Zuletzt bearbeitet am ' : 'Veröffentlicht am '; ?><?php echo $metaDate; ?>
            </div>
        <?php endif; ?>
        <p class="detail-content"><?php echo $post['content']; ?></p>
        <div class="detail-card-footer">
            <button id="detail-edit-button" class="button">Bearbeiten</button>
            <button id="detail-delete-button" class="button" data-id="<?php echo $post['id']; ?>">Löschen</button>
        </div>
    </div>
</main>
<script src="common.js"></script>
<script src="detailseite-script.js"></script>
</body>
</html>
