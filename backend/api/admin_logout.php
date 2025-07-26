<?php
/**
 * Admin Logout Script
 * Handles admin session termination
 * YAICESS Solutions - Tech Conference Registration System
 */

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Initialize response
$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

try {
    // Check if admin is logged in
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        $username = $_SESSION['admin_username'] ?? 'Unknown';
        
        // Destroy all session data
        session_unset();
        session_destroy();
        
        // Start a new session to send response
        session_start();
        
        $response['success'] = true;
        $response['message'] = "Logout successful!";
        $response['data'] = [
            'logged_out_at' => date('Y-m-d H:i:s')
        ];
        
        // Log successful logout
        error_log("Admin logout successful: " . $username);
        
        http_response_code(200);
    } else {
        $response['message'] = "No active session found.";
        http_response_code(400);
    }

} catch (Exception $e) {
    $response['message'] = "An error occurred during logout.";
    
    // Log error for debugging
    error_log("Logout error: " . $e->getMessage());
    
    http_response_code(500);
}

echo json_encode($response);
?>