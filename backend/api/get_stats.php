<?php
/**
 * Get Dashboard Statistics API
 * Provides registration statistics for admin dashboard
 * YAICESS Solutions - Tech Conference Registration System
 */

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../includes/functions.php';
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

try {
    // Get database statistics
    $stats = getDatabaseStats();
    
    if ($stats !== null) {
        $response['success'] = true;
        $response['message'] = "Statistics fetched successfully.";
        $response['data'] = [
            'total_registrations' => (int)$stats['total_registrations'],
            'recent_registrations' => (int)$stats['recent_registrations'],
            'by_session' => $stats['by_session'],
            'last_updated' => date('Y-m-d H:i:s')
        ];
        
        http_response_code(200);
    } else {
        $response['message'] = "Failed to fetch statistics.";
        http_response_code(500);
    }

} catch (Exception $e) {
    $response['message'] = "An error occurred while fetching statistics.";
    
    // Log error for debugging
    error_log("Get stats error: " . $e->getMessage());
    
    http_response_code(500);
}

echo json_encode($response);
?>