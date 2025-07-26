/**
 * Main JavaScript File
 * Common functionality shared across all pages
 * YAICESS Solutions - Tech Conference Registration System
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeCommonComponents();
    loadGlobalStats();
});

/**
 * Initialize common components
 */
function initializeCommonComponents() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeAnimations();
    setupMessageHandlers();
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Active nav link highlighting
    highlightActiveNavLink();
}

/**
 * Highlight active navigation link
 */
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === 'index.html' && href === '#home') ||
            (currentPage === '' && href === '#home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just '#'
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize scroll animations
 */
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll(
        '.about-card, .speaker-card, .schedule-item, .stat-card, .hero-card'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Counter animations for stats
    animateStatsOnScroll();
}

/**
 * Animate statistics when they come into view
 */
function animateStatsOnScroll() {
    const statNumbers = document.querySelectorAll('.stat-number, .cta-number');
    
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const target = entry.target;
                const finalValue = parseInt(target.textContent) || 0;
                
                if (finalValue > 0) {
                    DataFormatter.animateCounter(target, 0, finalValue, 2000);
                    target.classList.add('animated');
                }
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

/**
 * Setup message handlers for global messages
 */
function setupMessageHandlers() {
    // Check for URL parameters with messages
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const messageType = urlParams.get('type') || 'info';
    
    if (message) {
        MessageDisplay.show(decodeURIComponent(message), messageType);
        
        // Clean URL
        const url = new URL(window.location);
        url.searchParams.delete('message');
        url.searchParams.delete('type');
        window.history.replaceState({}, document.title, url);
    }

    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
    });

    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });
}

/**
 * Load global statistics
 */
async function loadGlobalStats() {
    try {
        const response = await registrationAPI.getStats();
        
        if (response.success && response.data) {
            updateGlobalStatistics(response.data);
        }
    } catch (error) {
        console.error('Failed to load global stats:', error);
    }
}

/**
 * Update global statistics on homepage
 */
function updateGlobalStatistics(stats) {
    // Update total registrations on homepage
    const totalElement = document.getElementById('totalRegistrations');
    if (totalElement) {
        DataFormatter.animateCounter(totalElement, 0, stats.total_registrations);
    }

    // Update recent registrations
    const recentElement = document.getElementById('recentRegistrations');
    if (recentElement) {
        DataFormatter.animateCounter(recentElement, 0, stats.recent_registrations);
    }

    // Update capacity percentage
    const capacityElement = document.getElementById('capacityPercentage');
    if (capacityElement) {
        const percentage = Math.round((stats.total_registrations / 200) * 100);
        capacityElement.textContent = `${percentage}%`;
    }
}

/**
 * Utility function to get current page name
 */
function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

/**
 * Utility function to format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Utility function to validate form fields
 */
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            FormValidator.showFieldError(field.id, `${field.name || field.id} is required`);
            isValid = false;
        } else {
            FormValidator.hideFieldError(field.id);
        }
    });

    return isValid;
}

/**
 * Utility function to show loading overlay
 */
function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner-large"></div>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

/**
 * Utility function to hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Utility function to copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        MessageDisplay.success('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        MessageDisplay.error('Failed to copy to clipboard');
    }
}

/**
 * Utility function to download file
 */
function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func(...args);
    };
}

/**
 * Throttle function for performance optimization
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Global refresh function
function refreshData() {
    loadGlobalStats();
    
    // Trigger page-specific refresh if available
    if (typeof refreshStats === 'function') {
        refreshStats();
    }
    
    MessageDisplay.info('Data refreshed successfully');
}

// Export utility functions for global access
window.refreshData = refreshData;
window.formatCurrency = formatCurrency;
window.validateForm = validateForm;
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;
window.copyToClipboard = copyToClipboard;
window.downloadFile = downloadFile;
window.debounce = debounce;
window.throttle = throttle;