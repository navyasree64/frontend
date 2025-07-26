<?php
/**
 * Admin Login Processing Script
 * Handles admin authentication and session management
 * YAICESS Solutions - Tech Conference Registration System
 */

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../classes/Admin.php';

// Initialize response
$response = [
    'success' => false,
    'message' => '',
    'data' => null,
    'errors' => []
];

// Check if request method is POST
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    $response['message'] = "Only POST method is allowed.";
    http_response_code(405);
    echo json_encode($response);
    exit;
}

try {
    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // If JSON decode fails, try $_POST
    if (json_last_error() !== JSON_ERROR_NONE) {
        $data = $_POST;
    }

    // Validate required fields
    if (empty($data['username']) || empty($data['password'])) {
        $response['message'] = "Username and password are required.";
        $response['errors'][] = "Please provide both username and password.";
        http_response_code(400);
        echo json_encode($response);
        exit;
    }

    $username = trim($data['username']);
    $password = trim($data['password']);

    // Create admin object
    $admin = new Admin();

    // Attempt login
    if ($admin->login($username, $password)) {
        // Set session variables
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $admin->id;
        $_SESSION['admin_username'] = $admin->username;
        $_SESSION['admin_full_name'] = $admin->full_name;
        $_SESSION['admin_role'] = $admin->role;
        $_SESSION['login_time'] = time();

        $response['success'] = true;
        $response['message'] = "Login successful!";
        $response['data'] = [
            'admin_id' => $admin->id,
            'username' => $admin->username,
            'full_name' => $admin->full_name,
            'role' => $admin->role,
            'session_id' => session_id()
        ];

        // Log successful login
        error_log("Admin login successful: " . $admin->username);

        http_response_code(200);
    } else {
        $response['message'] = "Invalid username or password.";
        $response['errors'][] = "Login credentials are incorrect.";

        // Log failed login attempt
        error_log("Failed login attempt for username: " . $username);

        http_response_code(401);
    }

} catch (Exception $e) {
    $response['message'] = "An error occurred during login.";
    $response['errors'][] = "Internal server error.";
    
    // Log error for debugging
    error_log("Login error: " . $e->getMessage());
    
    http_response_code(500);
}

echo json_encode($response);
?>