<?php
include_once 'db.php';
/** @var mysqli $conn */

$id = $_GET['id'];
$stmt = mysqli_prepare($conn, "SELECT * FROM posts WHERE id = ?");
mysqli_stmt_bind_param($stmt, "i", $id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$post = mysqli_fetch_assoc($result);
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title><?php echo $post['title']; ?></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header class="header">
    <div class="header-content">
        <div id="headername" class="headername">
            KÖLN ESSENMEILE
        </div>
        <div class="toggle-spacer"></div>
        <button id="theme-toggle" class="darkmode-toggle">Toggle Mode</button>
    </div>
</header>

<div id="detail-edit-container" class="display-none pop-up">
    <div class="pop-up-card">
        <div class="new-post-header">
            <div class="new-post-header-title">Post bearbeiten</div>
        </div>
        <div class="pop-up-content">
            <div class="display-flex-column padding-10">
                <label class="label" for="detail-edit-title">Titel</label>
                <input type="text" id="detail-edit-title" class="input-field height-30" placeholder="Titel" value="<?php echo $post['title']; ?>">
            </div>
            <div class="display-flex-column padding-10">
                <label class="label" for="detail-edit-description">Beschreibung</label>
                <textarea id="detail-edit-description" class="input-field height-80" placeholder="Beschreibung"><?php echo $post['description']; ?></textarea>
            </div>
            <div class="display-flex-column padding-10">
                <label class="label" for="detail-edit-content">Inhalt</label>
                <textarea id="detail-edit-content" class="input-field height-200" placeholder="Inhalt"><?php echo $post['content']; ?></textarea>
            </div>
        </div>
        <div class="pop-up-footer">
            <button id="new-post-cancel" class="button">Abbrechen</button>
            <button id="detail-edit-submit" class="button" data-id="<?php echo $post['id']; ?>">Speichern</button>
        </div>
    </div>
</div>

<main class="detail-main-container">
    <div class="detail-container">
        <h1 class="detail-title"><?php echo $post['title']; ?></h1>
        <p class="detail-content"><?php echo $post['content']; ?></p>
        <div class="detail-card-footer">
            <button id="detail-edit-button" class="button">Bearbeiten</button>
            <button id="detail-delete-button" class="button" data-id="<?php echo $post['id']; ?>">Löschen</button>
        </div>
    </div>
</main>
</body>
<script src="post-script.js"></script>
</html>