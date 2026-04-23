<?php
$db_host="localhost";
$db_user="root";
$db_password="";
$db_db="blog";

$conn = mysqli_connect($db_host, $db_user, $db_password, $db_db);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

mysqli_set_charset($conn, "utf8");