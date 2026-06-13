<?php
include_once "db.php";

/** @var mysqli $conn */

header("Content-Type: application/json");

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Prüft das hochgeladene Bild. Gibt null zurück bei Erfolg / keinem Bild,
 * sonst eine Fehlermeldung als string.
 */
function validateUploadedImage(): ?string {
    if (!isset($_FILES['image'])) {
        return null;
    }
    $file = $_FILES['image'];

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        return 'Die Datei ist zu groß. Maximal 5 MB sind erlaubt.';
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return 'Upload fehlgeschlagen (Fehlercode ' . $file['error'] . ').';
    }
    if ($file['size'] > MAX_IMAGE_BYTES) {
        return 'Die Datei ist zu groß. Maximal 5 MB sind erlaubt.';
    }
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed)) {
        return 'Ungültiges Bildformat. Erlaubt: ' . implode(', ', $allowed) . '.';
    }
    return null;
}

// Wenn post_max_size überschritten wurde, ist $_POST/$_FILES leer.
// Content-Length erkennen und sauberen Fehler liefern.
if (
    $_SERVER['REQUEST_METHOD'] === 'POST'
    && empty($_POST)
    && empty($_FILES)
    && isset($_SERVER['CONTENT_LENGTH'])
    && (int)$_SERVER['CONTENT_LENGTH'] > 0
) {
    http_response_code(413);
    echo json_encode(['success' => false, 'error' => 'Die Datei ist zu groß. Maximal 5 MB sind erlaubt.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['search']) && trim($_GET['search']) !== '') {
        $search = '%' . trim($_GET['search']) . '%';
        $stmt = mysqli_prepare($conn,
            "SELECT * FROM posts
             WHERE title LIKE ? OR description LIKE ? OR content LIKE ?
             ORDER BY created_at DESC"
        );
        mysqli_stmt_bind_param($stmt, "sss", $search, $search, $search);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
    } else {
        $result = mysqli_query($conn,
            "SELECT * FROM posts ORDER BY created_at DESC"
        );
    }
    $posts = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $posts[] = $row;
    }
    echo json_encode($posts);

} elseif ($method === 'POST' && (!isset($_POST['_method']) || $_POST['_method'] !== 'PUT')) {
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    if ($title === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Ein Titel ist erforderlich."]);
        exit;
    }
    if (mb_strlen($title) > 32) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Titel darf maximal 32 Zeichen lang sein."]);
        exit;
    }
    $descriptionRaw = isset($_POST['description']) ? $_POST['description'] : (isset($data['description']) ? $data['description'] : '');
    if (mb_strlen($descriptionRaw) > 180) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Die Beschreibung darf maximal 180 Zeichen lang sein."]);
        exit;
    }
    $contentRaw = isset($_POST['content']) ? $_POST['content'] : (isset($data['content']) ? $data['content'] : '');
    if (mb_strlen($contentRaw) > 2000) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Inhalt darf maximal 2000 Zeichen lang sein."]);
        exit;
    }

    $imageError = validateUploadedImage();
    if ($imageError !== null) {
        http_response_code(413);
        echo json_encode(["success" => false, "error" => $imageError]);
        exit;
    }

    $description = $_POST['description'];
    $content = $_POST['content'];

    $stmt = mysqli_prepare($conn, "INSERT INTO posts (title, description, content, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
    mysqli_stmt_bind_param($stmt, "sss", $title, $description, $content);
    if (mysqli_stmt_execute($stmt)) {
        $newId = mysqli_insert_id($conn);

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $filename = uniqid('img_', true) . '.' . $ext;
            $uploadDir = __DIR__ . '/uploads/';
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
                $filePath = 'uploads/' . $filename;
                $imgStmt = mysqli_prepare($conn, "INSERT INTO images (post_id, file_path, is_cover) VALUES (?, ?, 1)");
                mysqli_stmt_bind_param($imgStmt, "is", $newId, $filePath);
                mysqli_stmt_execute($imgStmt);
            }
        }

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }

} elseif ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    if ($title === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Ein Titel ist erforderlich."]);
        exit;
    }
    if (mb_strlen($title) > 32) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Titel darf maximal 32 Zeichen lang sein."]);
        exit;
    }
    $descriptionRaw = isset($_POST['description']) ? $_POST['description'] : (isset($data['description']) ? $data['description'] : '');
    if (mb_strlen($descriptionRaw) > 180) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Die Beschreibung darf maximal 180 Zeichen lang sein."]);
        exit;
    }
    $contentRaw = isset($_POST['content']) ? $_POST['content'] : (isset($data['content']) ? $data['content'] : '');
    if (mb_strlen($contentRaw) > 2000) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Inhalt darf maximal 2000 Zeichen lang sein."]);
        exit;
    }

    $imageError = validateUploadedImage();
    if ($imageError !== null) {
        http_response_code(413);
        echo json_encode(["success" => false, "error" => $imageError]);
        exit;
    }

    $id = $_POST['id'];
    $description = $_POST['description'];
    $content = $_POST['content'];

    $stmt = mysqli_prepare($conn, "UPDATE posts SET title = ?, description = ?, content = ?, updated_at = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "sssi", $title, $description, $content, $id);
    if (mysqli_stmt_execute($stmt)) {
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $filename = uniqid('img_', true) . '.' . $ext;
            $uploadDir = __DIR__ . '/uploads/';
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
                $filePath = 'uploads/' . $filename;
                // Altes Cover-Bild ersetzen oder neues einfügen
                $delStmt = mysqli_prepare($conn, "DELETE FROM images WHERE post_id = ? AND is_cover = 1");
                mysqli_stmt_bind_param($delStmt, "i", $id);
                mysqli_stmt_execute($delStmt);
                $imgStmt = mysqli_prepare($conn, "INSERT INTO images (post_id, file_path, is_cover) VALUES (?, ?, 1)");
                mysqli_stmt_bind_param($imgStmt, "is", $id, $filePath);
                mysqli_stmt_execute($imgStmt);
            }
        }
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }

} elseif ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data['id'];
    $title = isset($data['title']) ? trim($data['title']) : '';
    if ($title === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Ein Titel ist erforderlich."]);
        exit;
    }
    if (mb_strlen($title) > 32) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Titel darf maximal 32 Zeichen lang sein."]);
        exit;
    }
    $descriptionRaw = isset($_POST['description']) ? $_POST['description'] : (isset($data['description']) ? $data['description'] : '');
    if (mb_strlen($descriptionRaw) > 180) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Die Beschreibung darf maximal 180 Zeichen lang sein."]);
        exit;
    }
    $contentRaw = isset($_POST['content']) ? $_POST['content'] : (isset($data['content']) ? $data['content'] : '');
    if (mb_strlen($contentRaw) > 2000) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Der Inhalt darf maximal 2000 Zeichen lang sein."]);
        exit;
    }
    $description = $data['description'];
    $content = $data['content'];
    $stmt = mysqli_prepare($conn, "UPDATE posts SET title = ?, description = ?, content = ?, updated_at = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "sssi", $title, $description, $content, $id);
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }

} elseif ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data['id'];
    // Zuerst Bilder-Einträge löschen (Foreign Key)
    $delImg = mysqli_prepare($conn, "DELETE FROM images WHERE post_id = ?");
    mysqli_stmt_bind_param($delImg, "i", $id);
    mysqli_stmt_execute($delImg);
    $stmt = mysqli_prepare($conn, "DELETE FROM posts WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }
}
