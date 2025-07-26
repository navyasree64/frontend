<?php
/**
 * Registration Testing Script
 * Unit tests for registration functionality
 * YAICESS Solutions - Tech Conference Registration System
 */

// Include required files
require_once '../classes/Registration.php';
require_once '../includes/functions.php';

echo "<h2>YAICESS Registration System - Unit Tests</h2>\n";
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

echo "Starting Registration Tests...\n\n";

// Test 1: Registration object creation
try {
    $registration = new Registration();
    runTest("Registration object creation", true, is_object($registration));
} catch (Exception $e) {
    runTest("Registration object creation", true, false);
    echo "   Error: " . $e->getMessage() . "\n";
}

// Test 2: Email validation
$registration = new Registration();
$registration->email = "test@example.com";
$registration->full_name = "Test User";
$registration->phone = "1234567890";
$registration->organization = "Test Org";
$registration->session_choice = "AI and Machine Learning Trends";

$validation_errors = $registration->validate();
runTest("Valid registration data", 0, count($validation_errors));

// Test 3: Invalid email validation
$registration->email = "invalid-email";
$validation_errors = $registration->validate();
runTest("Invalid email validation", true, count($validation_errors) > 0);

// Test 4: Empty name validation
$registration->email = "test@example.com";
$registration->full_name = "";
$validation_errors = $registration->validate();
runTest("Empty name validation", true, count($validation_errors) > 0);

// Test 5: Invalid phone validation
$registration->full_name = "Test User";
$registration->phone = "123";
$validation_errors = $registration->validate();
runTest("Invalid phone validation", true, count($validation_errors) > 0);

// Test 6: Email format validation function
runTest("Valid email format", true, validateEmail("test@example.com"));
runTest("Invalid email format", false, validateEmail("invalid-email"));

// Test 7: Phone validation function
runTest("Valid phone number", true, validatePhone("1234567890"));
runTest("Invalid phone number", false, validatePhone("123"));

// Test 8: Session choice validation
runTest("Valid session choice", true, validateSessionChoice("AI and Machine Learning Trends"));
runTest("Invalid session choice", false, validateSessionChoice("Invalid Session"));

// Test 9: Sanitization function
$dirty_input = "<script>alert('xss')</script>test";
$clean_input = sanitizeInput($dirty_input);
runTest("Input sanitization", true, $clean_input !== $dirty_input);

// Test 10: Random string generation
$random1 = generateRandomString(16);
$random2 = generateRandomString(16);
runTest("Random string generation", true, $random1 !== $random2);
runTest("Random string length", 16, strlen($random1));

echo "\n=== Test Results ===\n";
echo "Tests Passed: $tests_passed\n";
echo "Tests Failed: $tests_failed\n";
echo "Success Rate: " . round(($tests_passed / ($tests_passed + $tests_failed)) * 100, 2) . "%\n";

if ($tests_failed === 0) {
    echo "\n🎉 All tests passed! Registration system is working correctly.\n";
} else {
    echo "\n⚠️  Some tests failed. Please check the implementation.\n";
}

echo "</pre>\n";
?>