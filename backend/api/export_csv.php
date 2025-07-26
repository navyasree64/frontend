<?php
/**
 * Export Registrations to CSV
 * Exports all registrations to CSV file
 * YAICESS Solutions - Tech Conference Registration System
 */

session_start();

require_once '../classes/Registration.php';
require_once '../includes/auth_check.php';

// Check admin authentication
if (!isAdminLoggedIn()) {
    header("Location: ../../admin-login.html?error=unauthorized");
    exit;
}

try {
    // Create registration object
    $registration = new Registration();
    
    // Get all registrations
    $result = $registration->read();
    
    if (!$result) {
        throw new Exception("Failed to fetch registrations");
    }

    // Set headers for CSV download
    $filename = "yaicess_registrations_" . date('Y-m-d_H-i-s') . ".csv";
    
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    // Create file pointer for output
    $output = fopen('php://output', 'w');

    // Add CSV headers
    $headers = [
        'ID',
        'Full Name',
        'Email',
        'Phone',
        'Organization',
        'Session Choice',
        'Registration Date',
        'Status'
    ];
    
    fputcsv($output, $headers);

    // Add registration data
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $csv_row = [
                $row['id'],
                $row['full_name'],
                $row['email'],
                $row['phone'],
                $row['organization'],
                $row['session_choice'],
                $row['registration_date'],
                $row['status']
            ];
            
            fputcsv($output, $csv_row);
        }
    }

    // Close file pointer
    fclose($output);
    
    // Log export activity
    $admin_username = $_SESSION['admin_username'] ?? 'Unknown';
    error_log("CSV export by admin: " . $admin_username);

} catch (Exception $e) {
    // Handle errors
    error_log("CSV export error: " . $e->getMessage());
    
    // Redirect to admin dashboard with error
    header("Location: ../../admin-dashboard.html?error=export_failed");
    exit;
}
?>