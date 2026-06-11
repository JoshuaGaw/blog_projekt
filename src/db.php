<?php
$db_host="localhost";
$db_user="webdev3";
$db_password="XC@f6ueo6kdZ*u2m";
$db_db="webdev3";

$conn = mysqli_connect($db_host, $db_user, $db_password, $db_db);

if (!$conn) {
    header("Content-Type: application/json");
    die(json_encode(["error" => "Connection failed: " . mysqli_connect_error()]));
}

mysqli_set_charset($conn, "utf8");
