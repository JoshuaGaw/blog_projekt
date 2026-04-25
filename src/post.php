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
        <div class="headername">
            KÖLN ESSENMEILE
        </div>
        <div class="toggle-spacer"></div>
        <button id="theme-toggle" class="darkmode-toggle">Toggle Mode</button>
    </div>
</header>

<div id="detail-edit-container" class="display-none pop-up">
    <div class="form-container pop-up-card squircle-corners">
        <input type="text" id="detail-edit-title" placeholder="Titel" value="<?php echo $post['title']; ?>">
        <textarea id="detail-edit-content" placeholder="Inhalt"><?php echo $post['content']; ?></textarea>
        <button id="detail-edit-submit" data-id="<?php echo $post['id']; ?>">Speichern</button>
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