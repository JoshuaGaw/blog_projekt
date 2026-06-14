<?php
include_once "db.php";
include_once "validators.php";

// PHP Doc Kommentar, damit IDE weiß, dass die Variable schon initialisiert ist
/** @var mysqli $conn */

header("Content-Type: application/json");

rejectIfRequestTooLarge();

$method = $_SERVER['REQUEST_METHOD'];

// Method-Override: PUT/DELETE kommen als POST mit _method getarnt,
// damit FormData (Datei-Uploads) sauber von PHP gelesen werden.
if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {
    case 'GET': {
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
        break;
    }
    case 'POST': {
        validateInputData();

        $title = trim($_POST['title']);
        $description = trim($_POST['description']);
        $content = trim($_POST['content']);

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
        break;
    }
    case 'PUT': {
        validateInputData();

        $title = trim($_POST['title']);
        $id = $_POST['id'];
        $description = trim($_POST['description']);
        $content = trim($_POST['content']);

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
        break;
    }
    case 'DELETE': {
        $id = $_POST['id'];
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
        break;
    }
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "error" => "HTTP-Methode nicht erlaubt."]);
}
