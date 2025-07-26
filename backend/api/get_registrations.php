<?php
/**
 * Get Registrations API
 * Fetches all registrations for admin dashboard
 * YAICESS Solutions - Tech Conference Registration System
 */

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../classes/Registration.php';
require_once '../includes/auth_check.php';

// Initialize response
$response = [
    'success' => false,
    'message' => '',
    'data' => null,
    'total' => 0
];

// Check admin authentication
if (!isAdminLoggedIn()) {
    $response['message'] = "Unauthorized access. Please login as admin.";
    http_response_code(401);
    echo json_encode($response);
    exit;
}

try {
    // Create registration object
    $registration = new Registration();
    
    // Get all registrations
    $result = $registration->read();
    
    if ($result && $result->num_rows > 0) {
        $registrations = [];
        
        while ($row = $result->fetch_assoc()) {
            $registrations[] = [
                'id' => (int)$row['id'],
                'full_name' => $row['full_name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'organization' => $row['organization'],
                'session_choice' => $row['session_choice'],
                'registration_date' => $row['registration_date'],
                'status' => $row['status']
            ];
        }
        
        $response['success'] = true;
        $response['message'] = "Registrations fetched successfully.";
        $response['data'] = $registrations;
        $response['total'] = count($registrations);
        
        http_response_code(200);
    } else {
        $response['success'] = true;
        $response['message'] = "No registrations found.";
        $response['data'] = [];
        $response['total'] = 0;
        
        http_response_code(200);
    }

} catch (Exception $e) {
    $response['message'] = "An error occurred while fetching registrations.";
    
    // Log error for debugging
    error_log("Get registrations error: " . $e->getMessage());
    
    http_response_code(500);
}

echo json_encode($response);
?>