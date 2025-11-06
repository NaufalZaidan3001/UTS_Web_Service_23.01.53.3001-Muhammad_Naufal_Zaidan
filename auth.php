<?php
// auth.php - Authentication & Login System with Hash & Security
// Set secure cookie options
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);

session_start();

require_once 'config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

function sanitizeInput($data) {
    return htmlspecialchars(stripslashes(trim($data)), ENT_QUOTES, 'UTF-8');
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if ($action === 'register') {
        handleRegister($input);
    } elseif ($action === 'login') {
        handleLogin($input);
    } elseif ($action === 'logout') {
        handleLogout();
    }
} else {
    echo json_encode(['error' => 'Invalid request']);
}

// Register new user (Admin/Doctor/Receptionist)
function handleRegister($input) {
    global $conn;
    
    $username = sanitizeInput($input['username']);
    $email = sanitizeInput($input['email']);
    $password = $input['password'];
    $user_type = sanitizeInput($input['user_type']); // doctor, admin, receptionist
    $name = sanitizeInput($input['name']);
    
    // Validate inputs
    if (empty($username) || empty($email) || empty($password) || empty($user_type)) {
        echo json_encode(['error' => 'All fields are required']);
        return;
    }
    
    // Check if username already exists
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(['error' => 'Username already exists']);
        return;
    }
    
    // Hash password using PHP's password_hash
    $hashed_password = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Insert user into database
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, user_type, name) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $username, $email, $hashed_password, $user_type, $name);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User registered successfully']);
    } else {
        echo json_encode(['error' => 'Registration failed']);
    }
}

// Login user
function handleLogin($input) {
    global $conn;
    
    $username = sanitizeInput($input['username']);
    $password = $input['password'];
    
    if (empty($username) || empty($password)) {
        echo json_encode(['error' => 'Username and password are required']);
        return;
    }
    
    // Prepare statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT user_id, username, password_hash, user_type, name FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['error' => 'Invalid username or password']);
        return;
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password hash
    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['error' => 'Invalid username or password']);
        return;
    }
    
    // Regenerate session ID for security
    session_regenerate_id(true);
    
    // Set secure session variables
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['user_type'] = $user['user_type'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['login_time'] = time();
    
    // Set secure cookie
    setcookie('PHPSESSID', session_id(), [
        'expires' => time() + 3600,
        'path' => '/',
        'domain' => '',
        'secure' => false, // Set to true in production with HTTPS
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'user_type' => $user['user_type'],
            'name' => $user['name']
        ]
    ]);
}

// Logout user
function handleLogout() {
    // Destroy session
    session_destroy();
    
    // Clear cookie
    setcookie('PHPSESSID', '', time() - 3600, '/');
    
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

?>