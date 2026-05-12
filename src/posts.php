<?php
include_once "db.php";

/** @var mysqli $conn */

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = mysqli_query($conn,
        "SELECT p.*, i.file_path AS cover_image
         FROM posts p
         LEFT JOIN images i ON i.post_id = p.id AND i.is_cover = 1
         ORDER BY p.created_at DESC"
    );
    $posts = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $posts[] = $row;
    }
    echo json_encode($posts);

} elseif ($method === 'POST' && (!isset($_POST['_method']) || $_POST['_method'] !== 'PUT')) {
    $title = $_POST['title'];
    $description = $_POST['description'];
    $content = $_POST['content'];

    $stmt = mysqli_prepare($conn, "INSERT INTO posts (user_id, title, description, content, status, created_at, updated_at) VALUES (1, ?, ?, ?, 'published', NOW(), NOW())");
    mysqli_stmt_bind_param($stmt, "sss", $title, $description, $content);
    if (mysqli_stmt_execute($stmt)) {
        $newId = mysqli_insert_id($conn);

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array(strtolower($ext), $allowed)) {
                $filename = uniqid('img_', true) . '.' . $ext;
                $uploadDir = __DIR__ . '/uploads/';
                if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
                    $filePath = 'uploads/' . $filename;
                    $imgStmt = mysqli_prepare($conn, "INSERT INTO images (post_id, file_path, is_cover, uploaded_at) VALUES (?, ?, 1, NOW())");
                    mysqli_stmt_bind_param($imgStmt, "is", $newId, $filePath);
                    mysqli_stmt_execute($imgStmt);
                }
            }
        }

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }

} elseif ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $id = $_POST['id'];
    $title = $_POST['title'];
    $description = $_POST['description'];
    $content = $_POST['content'];

    $stmt = mysqli_prepare($conn, "UPDATE posts SET title = ?, description = ?, content = ?, updated_at = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "sssi", $title, $description, $content, $id);
    if (mysqli_stmt_execute($stmt)) {
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array(strtolower($ext), $allowed)) {
                $filename = uniqid('img_', true) . '.' . $ext;
                $uploadDir = __DIR__ . '/uploads/';
                if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
                    $filePath = 'uploads/' . $filename;
                    // Altes Cover-Bild ersetzen oder neues einfügen
                    $delStmt = mysqli_prepare($conn, "DELETE FROM images WHERE post_id = ? AND is_cover = 1");
                    mysqli_stmt_bind_param($delStmt, "i", $id);
                    mysqli_stmt_execute($delStmt);
                    $imgStmt = mysqli_prepare($conn, "INSERT INTO images (post_id, file_path, is_cover, uploaded_at) VALUES (?, ?, 1, NOW())");
                    mysqli_stmt_bind_param($imgStmt, "is", $id, $filePath);
                    mysqli_stmt_execute($imgStmt);
                }
            }
        }
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }

} elseif ($method === 'PUT') {
    parse_str(file_get_contents("php://input"), $data);
    $id = $data['id'];
    $title = $data['title'];
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
