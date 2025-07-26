/**
 * API Integration Layer
 * Handles all communication with the PHP backend
 * YAICESS Solutions - Tech Conference Registration System
 */

// API Configuration
const API_CONFIG = {
    BASE_URL: '../backend/api',
    ENDPOINTS: {
        REGISTER: '/register.php',
        ADMIN_LOGIN: '/admin_login.php',
        ADMIN_LOGOUT: '/admin_logout.php',
        GET_REGISTRATIONS: '/get_registrations.php',
        GET_STATS: '/get_stats.php',
        DELETE_REGISTRATION: '/delete_registration.php',
        EXPORT_CSV: '/export_csv.php'
    }
};

/**
 * Base API class for handling HTTP requests
 */
class API {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    /**
     * Make HTTP request with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin' // Include cookies for session
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
            // Handle non-JSON responses (like CSV downloads)
            if (endpoint === API_CONFIG.ENDPOINTS.EXPORT_CSV) {
                if (response.ok) {
                    return { success: true, blob: await response.blob() };
                } else {
                    throw new Error('Export failed');
                }
            }

            const data = await response.json();
            
            // Log API responses in development
            if (window.location.hostname === 'localhost') {
                console.log(`API ${endpoint}:`, data);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            return {
                success: false,
                message: 'Network error occurred. Please try again.',
                error: error.message
            };
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, data) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }
}

/**
 * Registration API methods
 */
class RegistrationAPI extends API {
    /**
     * Register new attendee
     */
    async register(registrationData) {
        return this.post(API_CONFIG.ENDPOINTS.REGISTER, registrationData);
    }

    /**
     * Get all registrations (admin only)
     */
    async getRegistrations() {
        return this.get(API_CONFIG.ENDPOINTS.GET_REGISTRATIONS);
    }

    /**
     * Get dashboard statistics
     */
    async getStats() {
        return this.get(API_CONFIG.ENDPOINTS.GET_STATS);
    }

    /**
     * Delete registration (admin only)
     */
    async deleteRegistration(registrationId) {
        return this.post(API_CONFIG.ENDPOINTS.DELETE_REGISTRATION, { id: registrationId });
    }

    /**
     * Export registrations as CSV (admin only)
     */
    async exportCSV() {
        return this.request(API_CONFIG.ENDPOINTS.EXPORT_CSV, { method: 'GET' });
    }
}

/**
 * Admin API methods
 */
class AdminAPI extends API {
    /**
     * Admin login
     */
    async login(username, password) {
        return this.post(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, { username, password });
    }

    /**
     * Admin logout
     */
    async logout() {
        return this.post(API_CONFIG.ENDPOINTS.ADMIN_LOGOUT, {});
    }

    /**
     * Check if admin is logged in (client-side check)
     */
    isLoggedIn() {
        return localStorage.getItem('admin_logged_in') === 'true';
    }

    /**
     * Set admin login state
     */
    setLoginState(isLoggedIn, adminData = null) {
        if (isLoggedIn) {
            localStorage.setItem('admin_logged_in', 'true');
            if (adminData) {
                localStorage.setItem('admin_data', JSON.stringify(adminData));
            }
        } else {
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('admin_data');
        }
    }

    /**
     * Get admin data
     */
    getAdminData() {
        const adminData = localStorage.getItem('admin_data');
        return adminData ? JSON.parse(adminData) : null;
    }
}

/**
 * Message display utility
 */
class MessageDisplay {
    static show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('messageContainer');
        const content = document.getElementById('messageContent');
        
        if (!container || !content) return;

        // Set message content and type
        content.textContent = message;
        content.className = `message ${type}`;
        
        // Show container
        container.style.display = 'block';
        
        // Auto-hide after duration
        setTimeout(() => {
            container.style.display = 'none';
        }, duration);
    }

    static success(message, duration = 5000) {
        this.show(message, 'success', duration);
    }

    static error(message, duration = 8000) {
        this.show(message, 'error', duration);
    }

    static info(message, duration = 5000) {
        this.show(message, 'info', duration);
    }

    static warning(message, duration = 6000) {
        this.show(message, 'warning', duration);
    }

    static hide() {
        const container = document.getElementById('messageContainer');
        if (container) {
            container.style.display = 'none';
        }
    }
}

/**
 * Loading state utility
 */
class LoadingState {
    static show(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    ${text}
                </div>
            `;
        }
    }

    static hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            const loadingElement = element.querySelector('.loading-state');
            if (loadingElement) {
                loadingElement.remove();
            }
        }
    }

    static showButton(button, text = 'Loading...') {
        if (typeof button === 'string') {
            button = document.getElementById(button);
        }
        
        if (button) {
            button.disabled = true;
            const spinner = button.querySelector('.loading-spinner');
            const span = button.querySelector('span');
            
            if (spinner) spinner.style.display = 'inline-block';
            if (span) span.textContent = text;
        }
    }

    static hideButton(button, originalText) {
        if (typeof button === 'string') {
            button = document.getElementById(button);
        }
        
        if (button) {
            button.disabled = false;
            const spinner = button.querySelector('.loading-spinner');
            const span = button.querySelector('span');
            
            if (spinner) spinner.style.display = 'none';
            if (span && originalText) span.textContent = originalText;
        }
    }
}

/**
 * Form validation utility
 */
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]{10,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const fieldElement = document.getElementById(fieldId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (fieldElement) {
            fieldElement.classList.add('error');
        }
    }

    static hideFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        const fieldElement = document.getElementById(fieldId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (fieldElement) {
            fieldElement.classList.remove('error');
        }
    }

    static clearAllErrors(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const errorElements = form.querySelectorAll('.error-message');
            const fieldElements = form.querySelectorAll('.error');
            
            errorElements.forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            
            fieldElements.forEach(el => {
                el.classList.remove('error');
            });
        }
    }
}

/**
 * Data formatting utilities
 */
class DataFormatter {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }

    static truncateText(text, maxLength = 30) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static animateCounter(element, start, end, duration = 1000) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (!element) return;

        const range = end - start;
        const minTimer = 50;
        const stepTime = Math.abs(Math.floor(duration / range));
        
        const timer = Math.max(stepTime, minTimer);
        const steps = Math.ceil(duration / timer);
        const increment = range / steps;
        
        let current = start;
        const counter = setInterval(() => {
            current += increment;
            element.textContent = Math.round(current);
            
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                clearInterval(counter);
                element.textContent = end;
            }
        }, timer);
    }
}

// Global API instances
const registrationAPI = new RegistrationAPI();
const adminAPI = new AdminAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registrationAPI,
        adminAPI,
        MessageDisplay,
        LoadingState,
        FormValidator,
        DataFormatter
    };
}