<?php
include_once "db.php";

/** @var mysqli $conn */

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = mysqli_query($conn, "SELECT * FROM posts ORDER BY created_at DESC");
    $posts = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $posts[] = $row;
    }
    echo json_encode($posts);

} elseif ($method === 'POST') {
    $title = $_POST['title'];
    $description = $_POST['description'];
    $content = $_POST['content'];
    $stmt = mysqli_prepare($conn, "INSERT INTO posts (user_id, title, description, content, status, created_at, updated_at) VALUES (1, ?, ?, ?, 'published', NOW(), NOW())");
    mysqli_stmt_bind_param($stmt, "sss", $title, $description, $content);
    if (mysqli_stmt_execute($stmt)) {
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
    $stmt = mysqli_prepare($conn, "DELETE FROM posts WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $id);
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }
}
