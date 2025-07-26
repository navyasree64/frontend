<?php
/**
 * Authentication Check Utilities
 * Helper functions for session and authentication management
 * YAICESS Solutions - Tech Conference Registration System
 */

/**
 * Check if admin is logged in
 */
function isAdminLoggedIn() {
    // Check if session is started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['admin_logged_in']) && 
           $_SESSION['admin_logged_in'] === true &&
           isset($_SESSION['admin_id']) &&
           isset($_SESSION['admin_username']);
}

/**
 * Require admin login (redirect if not logged in)
 */
function requireAdminLogin($redirect_url = '../../admin-login.html') {
    if (!isAdminLoggedIn()) {
        header("Location: " . $redirect_url . "?error=login_required");
        exit;
    }
}

/**
 * Get current admin info
 */
function getCurrentAdmin() {
    if (!isAdminLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['admin_id'],
        'username' => $_SESSION['admin_username'],
        'full_name' => $_SESSION['admin_full_name'] ?? '',
        'role' => $_SESSION['admin_role'] ?? 'admin',
        'login_time' => $_SESSION['login_time'] ?? null
    ];
}

/**
 * Check session timeout (optional)
 */
function checkSessionTimeout($timeout_minutes = 120) {
    if (!isAdminLoggedIn()) {
        return false;
    }
    
    $login_time = $_SESSION['login_time'] ?? time();
    $current_time = time();
    $session_duration = ($current_time - $login_time) / 60; // in minutes
    
    if ($session_duration > $timeout_minutes) {
        // Session expired
        session_unset();
        session_destroy();
        return false;
    }
    
    return true;
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['csrf_token']) && 
           hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Log security events
 */
function logSecurityEvent($event, $details = '') {
    $admin = getCurrentAdmin();
    $admin_info = $admin ? $admin['username'] : 'Anonymous';
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    
    $log_message = date('Y-m-d H:i:s') . " - Security Event: $event - Admin: $admin_info - IP: $ip_address";
    if ($details) {
        $log_message .= " - Details: $details";
    }
    
    error_log($log_message);
}
?>