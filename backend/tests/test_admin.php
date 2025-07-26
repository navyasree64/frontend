<?php
/**
 * Admin Testing Script
 * Unit tests for admin functionality
 * YAICESS Solutions - Tech Conference Registration System
 */

// Include required files
require_once '../classes/Admin.php';
require_once '../includes/auth_check.php';

echo "<h2>YAICESS Admin System - Unit Tests</h2>\n";
echo "<pre>\n";

// Test counter
$tests_passed = 0;
$tests_failed = 0;

/**
 * Test helper function
 */
function runTest($test_name, $expected, $actual) {
    global $tests_passed, $tests_failed;
    
    if ($expected === $actual) {
        echo "✅ PASS: $test_name\n";
        $tests_passed++;
    } else {
        echo "❌ FAIL: $test_name\n";
        echo "   Expected: " . var_export($expected, true) . "\n";
        echo "   Actual: " . var_export($actual, true) . "\n";
        $tests_failed++;
    }
}

echo "Starting Admin Tests...\n\n";

// Test 1: Admin object creation
try {
    $admin = new Admin();
    runTest("Admin object creation", true, is_object($admin));
} catch (Exception $e) {
    runTest("Admin object creation", true, false);
    echo "   Error: " . $e->getMessage() . "\n";
}

// Test 2: Admin validation - valid data
$admin = new Admin();
$admin->username = "testadmin";
$admin->password = "password123";
$admin->email = "admin@test.com";
$admin->full_name = "Test Admin";

$validation_errors = $admin->validate();
runTest("Valid admin data", 0, count($validation_errors));

// Test 3: Admin validation - short username
$admin->username = "ab";
$validation_errors = $admin->validate();
runTest("Short username validation", true, count($validation_errors) > 0);

// Test 4: Admin validation - short password
$admin->username = "testadmin";
$admin->password = "123";
$validation_errors = $admin->validate();
runTest("Short password validation", true, count($validation_errors) > 0);

// Test 5: Admin validation - invalid email
$admin->password = "password123";
$admin->email = "invalid-email";
$validation_errors = $admin->validate();
runTest("Invalid email validation", true, count($validation_errors) > 0);

// Test 6: Admin validation - empty full name
$admin->email = "admin@test.com";
$admin->full_name = "";
$validation_errors = $admin->validate();
runTest("Empty full name validation", true, count($validation_errors) > 0);

// Test 7: Password hashing verification
$plain_password = "testpassword123";
$hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);
runTest("Password hash verification", true, password_verify($plain_password, $hashed_password));
runTest("Wrong password verification", false, password_verify("wrongpassword", $hashed_password));

// Test 8: Authentication helper functions
session_start();

// Test initial state (not logged in)
runTest("Initial login state", false, isAdminLoggedIn());

// Test logged in state
$_SESSION['admin_logged_in'] = true;
$_SESSION['admin_id'] = 1;
$_SESSION['admin_username'] = 'testadmin';
runTest("Logged in state", true, isAdminLoggedIn());

// Test current admin info
$current_admin = getCurrentAdmin();
runTest("Current admin username", 'testadmin', $current_admin['username']);

// Test session timeout
$_SESSION['login_time'] = time() - 7200; // 2 hours ago
runTest("Session timeout (2 hours)", false, checkSessionTimeout(60)); // 60 minute timeout

// Test valid session
$_SESSION['login_time'] = time() - 1800; // 30 minutes ago
runTest("Valid session (30 minutes)", true, checkSessionTimeout(60)); // 60 minute timeout

// Test CSRF token generation
$token1 = generateCSRFToken();
$token2 = generateCSRFToken();
runTest("CSRF token generation", true, !empty($token1));
runTest("CSRF token consistency", $token1, $token2); // Should be same in same session

// Test CSRF token verification
runTest("Valid CSRF token", true, verifyCSRFToken($token1));
runTest("Invalid CSRF token", false, verifyCSRFToken("invalid_token"));

echo "\n=== Test Results ===\n";
echo "Tests Passed: $tests_passed\n";
echo "Tests Failed: $tests_failed\n";
echo "Success Rate: " . round(($tests_passed / ($tests_passed + $tests_failed)) * 100, 2) . "%\n";

if ($tests_failed === 0) {
    echo "\n🎉 All tests passed! Admin system is working correctly.\n";
} else {
    echo "\n⚠️  Some tests failed. Please check the implementation.\n";
}

echo "</pre>\n";
?>