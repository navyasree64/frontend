/**
 * Admin Login Handler
 * Handles admin authentication and login form
 * YAICESS Solutions - Tech Conference Registration System
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminLogin();
    checkExistingLogin();
});

/**
 * Initialize admin login form
 */
function initializeAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    const togglePassword = document.getElementById('togglePassword');

    if (!form) {
        console.error('Admin login form not found');
        return;
    }

    // Form submission handler
    form.addEventListener('submit', handleLoginSubmission);

    // Password toggle functionality
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }

    // Focus username field
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }

    // Handle Enter key on password field
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
}

/**
 * Check if admin is already logged in
 */
function checkExistingLogin() {
    if (adminAPI.isLoggedIn()) {
        // Redirect to dashboard if already logged in
        window.location.href = 'admin-dashboard.html';
    }
}

/**
 * Handle login form submission
 */
async function handleLoginSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.querySelector('span').textContent;

    // Clear previous errors
    FormValidator.clearAllErrors('adminLoginForm');
    MessageDisplay.hide();

    // Get form data
    const formData = new FormData(form);
    const username = formData.get('username').trim();
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';

    // Validate form data
    const validationErrors = validateLoginData(username, password);
    if (validationErrors.length > 0) {
        displayValidationErrors(validationErrors);
        return;
    }

    // Show loading state
    LoadingState.showButton(loginBtn, 'Logging in...');

    try {
        // Attempt login
        const response = await adminAPI.login(username, password);

        if (response.success) {
            // Store login state
            adminAPI.setLoginState(true, response.data);

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberAdmin', 'true');
            }

            // Show success message
            MessageDisplay.success('Login successful! Redirecting to dashboard...');

            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        } else {
            // Handle login errors
            handleLoginErrors(response);
        }
    } catch (error) {
        console.error('Login error:', error);
        MessageDisplay.error('An unexpected error occurred. Please try again.');
    } finally {
        // Hide loading state
        LoadingState.hideButton(loginBtn, originalText);
    }
}

/**
 * Validate login data
 */
function validateLoginData(username, password) {
    const errors = [];

    // Username validation
    if (!username) {
        errors.push({ field: 'username', message: 'Username is required' });
    } else if (username.length < 3) {
        errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    }

    // Password validation
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 6) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    return errors;
}

/**
 * Display validation errors
 */
function displayValidationErrors(errors) {
    errors.forEach(error => {
        FormValidator.showFieldError(error.field, error.message);
    });

    // Show general error message
    MessageDisplay.error('Please correct the errors below and try again.');

    // Focus first error field
    if (errors.length > 0) {
        const firstErrorField = document.getElementById(errors[0].field);
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
}

/**
 * Handle login errors from API
 */
function handleLoginErrors(response) {
    if (response.message) {
        if (response.message.toLowerCase().includes('username') || 
            response.message.toLowerCase().includes('password') ||
            response.message.toLowerCase().includes('credentials')) {
            // Generic invalid credentials error
            MessageDisplay.error('Invalid username or password. Please try again.');
        } else {
            MessageDisplay.error(response.message);
        }
    } else {
        MessageDisplay.error('Login failed. Please check your credentials and try again.');
    }

    // Clear password field for security
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.value = '';
        passwordField.focus();
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.querySelector('#togglePassword i');
    
    if (!passwordField || !toggleIcon) return;

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordField.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

/**
 * Demo login function (for demo credentials)
 */
function demoLogin() {
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    if (usernameField && passwordField) {
        usernameField.value = 'admin';
        passwordField.value = 'admin123';
        
        // Focus submit button
        const submitBtn = document.getElementById('loginBtn');
        if (submitBtn) {
            submitBtn.focus();
        }
    }
}

// Add click handler for demo credentials
document.addEventListener('DOMContentLoaded', function() {
    const demoCredentials = document.querySelector('.demo-credentials');
    if (demoCredentials) {
        demoCredentials.addEventListener('click', demoLogin);
        demoCredentials.style.cursor = 'pointer';
        demoCredentials.title = 'Click to auto-fill demo credentials';
    }
});

// Export functions for global access
window.demoLogin = demoLogin;