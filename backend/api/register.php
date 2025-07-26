<?php
/**
 * Registration Form Processing Script
 * Handles form submission and database insertion
 * YAICESS Solutions - Tech Conference Registration System
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../classes/Registration.php';

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
    // Get POST data (JSON or form data)
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // If JSON decode fails, try $_POST
    if (json_last_error() !== JSON_ERROR_NONE) {
        $data = $_POST;
    }

    // Validate required fields
    $required_fields = ['full_name', 'email', 'phone', 'organization', 'session_choice'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            $response['errors'][] = ucfirst(str_replace('_', ' ', $field)) . " is required.";
        }
    }

    if (!empty($response['errors'])) {
        $response['message'] = "Validation failed.";
        http_response_code(400);
        echo json_encode($response);
        exit;
    }

    // Create registration object
    $registration = new Registration();
    
    // Set registration data
    $registration->full_name = trim($data['full_name']);
    $registration->email = trim(strtolower($data['email']));
    $registration->phone = trim($data['phone']);
    $registration->organization = trim($data['organization']);
    $registration->session_choice = trim($data['session_choice']);

    // Validate data
    $validation_errors = $registration->validate();
    if (!empty($validation_errors)) {
        $response['errors'] = $validation_errors;
        $response['message'] = "Validation failed.";
        http_response_code(400);
        echo json_encode($response);
        exit;
    }

    // Check if email already exists
    if ($registration->emailExists()) {
        $response['message'] = "Email address is already registered.";
        $response['errors'][] = "This email address has already been used for registration.";
        http_response_code(409);
        echo json_encode($response);
        exit;
    }

    // Create registration
    if ($registration->create()) {
        $response['success'] = true;
        $response['message'] = "Registration successful!";
        $response['data'] = [
            'registration_id' => $registration->id,
            'full_name' => $registration->full_name,
            'email' => $registration->email,
            'session_choice' => $registration->session_choice
        ];
        
        // Log successful registration
        error_log("New registration: " . $registration->email . " for " . $registration->session_choice);
        
        http_response_code(201);
    } else {
        $response['message'] = "Registration failed. Please try again.";
        $response['errors'][] = "Database error occurred while processing registration.";
        http_response_code(500);
    }

} catch (Exception $e) {
    $response['message'] = "An error occurred while processing your registration.";
    $response['errors'][] = "Internal server error.";
    
    // Log error for debugging
    error_log("Registration error: " . $e->getMessage());
    
    http_response_code(500);
}

echo json_encode($response);
?>