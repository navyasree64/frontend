/**
 * Registration Form Handler
 * Handles form submission and validation for conference registration
 * YAICESS Solutions - Tech Conference Registration System
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeRegistrationForm();
    loadRegistrationStats();
});

/**
 * Initialize registration form
 */
function initializeRegistrationForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');

    if (!form || !submitBtn) {
        console.error('Registration form elements not found');
        return;
    }

    // Form submission handler
    form.addEventListener('submit', handleFormSubmission);

    // Real-time validation
    setupRealTimeValidation();

    // Phone number formatting
    setupPhoneFormatting();

    // Check URL parameters for pre-filled data
    checkURLParameters();
}

/**
 * Handle form submission
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.querySelector('span').textContent;

    // Clear previous errors
    FormValidator.clearAllErrors('registrationForm');
    MessageDisplay.hide();

    // Get form data
    const formData = new FormData(form);
    const registrationData = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        organization: formData.get('organization'),
        session_choice: formData.get('session_choice')
    };

    // Validate form data
    const validationErrors = validateRegistrationData(registrationData);
    if (validationErrors.length > 0) {
        displayValidationErrors(validationErrors);
        return;
    }

    // Show loading state
    LoadingState.showButton(submitBtn, 'Registering...');

    try {
        // Submit registration
        const response = await registrationAPI.register(registrationData);

        if (response.success) {
            // Store registration data for success page
            sessionStorage.setItem('registrationData', JSON.stringify(response.data));
            
            // Show success message briefly
            MessageDisplay.success('Registration successful! Redirecting...');
            
            // Redirect to success page after short delay
            setTimeout(() => {
                window.location.href = 'success.html';
            }, 1500);
        } else {
            // Handle registration errors
            handleRegistrationErrors(response);
        }
    } catch (error) {
        console.error('Registration error:', error);
        MessageDisplay.error('An unexpected error occurred. Please try again.');
    } finally {
        // Hide loading state
        LoadingState.hideButton(submitBtn, originalText);
    }
}

/**
 * Validate registration data
 */
function validateRegistrationData(data) {
    const errors = [];

    // Full name validation
    if (!FormValidator.validateRequired(data.full_name)) {
        errors.push({ field: 'fullName', message: 'Full name is required' });
    } else if (data.full_name.length < 2) {
        errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
    }

    // Email validation
    if (!FormValidator.validateRequired(data.email)) {
        errors.push({ field: 'email', message: 'Email address is required' });
    } else if (!FormValidator.validateEmail(data.email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    // Phone validation
    if (!FormValidator.validateRequired(data.phone)) {
        errors.push({ field: 'phone', message: 'Phone number is required' });
    } else if (!FormValidator.validatePhone(data.phone)) {
        errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }

    // Organization validation
    if (!FormValidator.validateRequired(data.organization)) {
        errors.push({ field: 'organization', message: 'Organization is required' });
    }

    // Session choice validation
    if (!FormValidator.validateRequired(data.session_choice)) {
        errors.push({ field: 'sessionChoice', message: 'Please select a preferred session' });
    }

    // Terms and conditions check
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        errors.push({ field: 'terms', message: 'You must agree to the terms and conditions' });
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

    // Scroll to first error field
    if (errors.length > 0) {
        const firstErrorField = document.getElementById(errors[0].field);
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
    }
}

/**
 * Handle registration errors from API
 */
function handleRegistrationErrors(response) {
    if (response.errors && response.errors.length > 0) {
        // Handle specific field errors if provided by backend
        response.errors.forEach(error => {
            if (error.toLowerCase().includes('email')) {
                FormValidator.showFieldError('email', error);
            } else if (error.toLowerCase().includes('phone')) {
                FormValidator.showFieldError('phone', error);
            } else if (error.toLowerCase().includes('name')) {
                FormValidator.showFieldError('fullName', error);
            } else if (error.toLowerCase().includes('organization')) {
                FormValidator.showFieldError('organization', error);
            } else if (error.toLowerCase().includes('session')) {
                FormValidator.showFieldError('sessionChoice', error);
            }
        });
        
        MessageDisplay.error(response.message || 'Registration failed. Please check the errors below.');
    } else {
        MessageDisplay.error(response.message || 'Registration failed. Please try again.');
    }
}

/**
 * Setup real-time validation
 */
function setupRealTimeValidation() {
    const fields = ['fullName', 'email', 'phone', 'organization', 'sessionChoice'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateField(fieldId));
            field.addEventListener('input', () => {
                // Clear error on input
                FormValidator.hideFieldError(fieldId);
            });
        }
    });
}

/**
 * Validate individual field
 */
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (fieldId) {
        case 'fullName':
            if (!value) {
                isValid = false;
                errorMessage = 'Full name is required';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Full name must be at least 2 characters';
            }
            break;

        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'Email address is required';
            } else if (!FormValidator.validateEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;

        case 'phone':
            if (!value) {
                isValid = false;
                errorMessage = 'Phone number is required';
            } else if (!FormValidator.validatePhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;

        case 'organization':
            if (!value) {
                isValid = false;
                errorMessage = 'Organization is required';
            }
            break;

        case 'sessionChoice':
            if (!value) {
                isValid = false;
                errorMessage = 'Please select a preferred session';
            }
            break;
    }

    if (!isValid) {
        FormValidator.showFieldError(fieldId, errorMessage);
    } else {
        FormValidator.hideFieldError(fieldId);
    }

    return isValid;
}

/**
 * Setup phone number formatting
 */
function setupPhoneFormatting() {
    const phoneField = document.getElementById('phone');
    if (!phoneField) return;

    phoneField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
        }
        
        e.target.value = value;
    });
}

/**
 * Check URL parameters for pre-filled data
 */
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Pre-fill session if specified in URL
    const sessionParam = urlParams.get('session');
    if (sessionParam) {
        const sessionSelect = document.getElementById('sessionChoice');
        if (sessionSelect) {
            // Find matching option
            const options = sessionSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value.toLowerCase().includes(sessionParam.toLowerCase())) {
                    sessionSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // Pre-fill other fields if provided
    const emailParam = urlParams.get('email');
    if (emailParam) {
        const emailField = document.getElementById('email');
        if (emailField) emailField.value = emailParam;
    }
}

/**
 * Load registration statistics
 */
async function loadRegistrationStats() {
    try {
        const response = await registrationAPI.getStats();
        
        if (response.success && response.data) {
            // Update total registrations
            const totalElement = document.getElementById('totalRegistrationsReg');
            if (totalElement) {
                DataFormatter.animateCounter(totalElement, 0, response.data.total_registrations);
            }

            // Update recent registrations
            const recentElement = document.getElementById('recentRegistrationsReg');
            if (recentElement) {
                DataFormatter.animateCounter(recentElement, 0, response.data.recent_registrations);
            }
        }
    } catch (error) {
        console.error('Failed to load registration stats:', error);
    }
}

/**
 * Refresh registration stats
 */
function refreshStats() {
    loadRegistrationStats();
}

// Export functions for global access
window.refreshStats = refreshStats;