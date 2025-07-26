<?php
/**
 * Delete Registration API
 * Soft deletes (cancels) a registration
 * YAICESS Solutions - Tech Conference Registration System
 */

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../classes/Registration.php';
require_once '../includes/auth_check.php';

// Initialize response
$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

// Check admin authentication
if (!isAdminLoggedIn()) {
    $response['message'] = "Unauthorized access. Please login as admin.";
    http_response_code(401);
    echo json_encode($response);
    exit;
}

// Check if request method is allowed
if (!in_array($_SERVER["REQUEST_METHOD"], ["DELETE", "POST"])) {
    $response['message'] = "Only DELETE and POST methods are allowed.";
    http_response_code(405);
    echo json_encode($response);
    exit;
}

try {
    // Get registration ID
    $registration_id = null;
    
    if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
        // For DELETE requests, get ID from URL or request body
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $registration_id = $data['id'] ?? $_GET['id'] ?? null;
    } else {
        // For POST requests, get ID from POST data
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $data = $_POST;
        }
        
        $registration_id = $data['id'] ?? null;
    }

    // Validate registration ID
    if (empty($registration_id) || !is_numeric($registration_id)) {
        $response['message'] = "Valid registration ID is required.";
        http_response_code(400);
        echo json_encode($response);
        exit;
    }

    // Create registration object
    $registration = new Registration();
    $registration->id = (int)$registration_id;

    // Check if registration exists
    if (!$registration->readOne()) {
        $response['message'] = "Registration not found.";
        http_response_code(404);
        echo json_encode($response);
        exit;
    }

    // Store registration details for response
    $deleted_registration = [
        'id' => $registration->id,
        'full_name' => $registration->full_name,
        'email' => $registration->email,
        'session_choice' => $registration->session_choice
    ];

    // Delete (cancel) registration
    if ($registration->delete()) {
        $response['success'] = true;
        $response['message'] = "Registration cancelled successfully.";
        $response['data'] = $deleted_registration;
        
        // Log successful deletion
        error_log("Registration cancelled: ID " . $registration_id . " (" . $registration->email . ")");
        
        http_response_code(200);
    } else {
        $response['message'] = "Failed to cancel registration.";
        http_response_code(500);
    }

} catch (Exception $e) {
    $response['message'] = "An error occurred while cancelling registration.";
    
    // Log error for debugging
    error_log("Delete registration error: " . $e->getMessage());
    
    http_response_code(500);
}

echo json_encode($response);
?>