<?php
/**
 * Utility Functions
 * Common helper functions for the application
 * YAICESS Solutions - Tech Conference Registration System
 */

/**
 * Send JSON response
 */
function sendJSONResponse($success, $message, $data = null, $http_code = 200) {
    http_response_code($http_code);
    header('Content-Type: application/json');
    
    $response = [
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response);
    exit;
}

/**
 * Validate email format
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate phone number
 */
function validatePhone($phone) {
    // Remove all non-digit characters
    $phone = preg_replace('/[^0-9]/', '', $phone);
    
    // Check if phone number is between 10-15 digits
    return strlen($phone) >= 10 && strlen($phone) <= 15;
}

/**
 * Generate random string
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Format date for display
 */
function formatDate($date, $format = 'M d, Y H:i') {
    return date($format, strtotime($date));
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                
                if (filter_var($ip, FILTER_VALIDATE_IP, 
                    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
}

/**
 * Log activity
 */
function logActivity($action, $details = '', $user_id = null) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'action' => $action,
        'details' => $details,
        'user_id' => $user_id,
        'ip_address' => getClientIP(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ];
    
    $log_message = json_encode($log_entry);
    error_log("Activity Log: " . $log_message);
}

/**
 * Send email notification (basic implementation)
 */
function sendEmail($to, $subject, $message, $from = 'noreply@yaicess.com') {
    $headers = [
        'From: ' . $from,
        'Reply-To: ' . $from,
        'Content-Type: text/html; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($to, $subject, $message, implode("\r\n", $headers));
}

/**
 * Generate registration confirmation email
 */
function generateConfirmationEmail($registration_data) {
    $template = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>YAICESS Solutions Tech Conference</h1>
                <p>Registration Confirmation</p>
            </div>
            <div class="content">
                <h2>Thank you for registering!</h2>
                <p>Dear ' . htmlspecialchars($registration_data['full_name']) . ',</p>
                <p>Your registration for the YAICESS Solutions Tech Conference has been confirmed.</p>
                
                <h3>Registration Details:</h3>
                <ul>
                    <li><strong>Name:</strong> ' . htmlspecialchars($registration_data['full_name']) . '</li>
                    <li><strong>Email:</strong> ' . htmlspecialchars($registration_data['email']) . '</li>
                    <li><strong>Phone:</strong> ' . htmlspecialchars($registration_data['phone']) . '</li>
                    <li><strong>Organization:</strong> ' . htmlspecialchars($registration_data['organization']) . '</li>
                    <li><strong>Session:</strong> ' . htmlspecialchars($registration_data['session_choice']) . '</li>
                    <li><strong>Registration ID:</strong> #' . $registration_data['id'] . '</li>
                </ul>
                
                <p>We look forward to seeing you at the conference!</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 YAICESS Solutions. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>';
    
    return $template;
}

/**
 * Validate session choice against available sessions
 */
function validateSessionChoice($session_choice) {
    $valid_sessions = [
        'AI and Machine Learning Trends',
        'Cloud Computing Strategies',
        'Cybersecurity in Modern Apps',
        'DevOps and Automation'
    ];
    
    return in_array($session_choice, $valid_sessions);
}

/**
 * Get database statistics
 */
function getDatabaseStats() {
    try {
        require_once '../config/database.php';
        $database = new Database();
        $conn = $database->getConnection();
        
        $stats = [];
        
        // Total registrations
        $result = $conn->query("SELECT COUNT(*) as total FROM registrations WHERE status = 'active'");
        $stats['total_registrations'] = $result->fetch_assoc()['total'];
        
        // Registrations by session
        $result = $conn->query("SELECT session_choice, COUNT(*) as count FROM registrations WHERE status = 'active' GROUP BY session_choice");
        $stats['by_session'] = [];
        while ($row = $result->fetch_assoc()) {
            $stats['by_session'][$row['session_choice']] = $row['count'];
        }
        
        // Recent registrations (last 24 hours)
        $result = $conn->query("SELECT COUNT(*) as total FROM registrations WHERE status = 'active' AND registration_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $stats['recent_registrations'] = $result->fetch_assoc()['total'];
        
        return $stats;
        
    } catch (Exception $e) {
        error_log("Database stats error: " . $e->getMessage());
        return null;
    }
}
?>