<?php
// config/db.php - Database Configuration
// session_start();

// InfinityFree Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'localhost');
define('DB_PASS', '');
define('DB_NAME', 'database');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Set charset to utf8
$conn->set_charset("utf8mb4");

// Enable prepared statements for security
$conn->set_charset("utf8mb4");

?>