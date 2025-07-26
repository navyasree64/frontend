/**
 * Admin Dashboard Handler
 * Manages all admin dashboard functionality with backend integration
 * YAICESS Solutions - Tech Conference Registration System
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminDashboard();
});

/**
 * Initialize admin dashboard
 */
function initializeAdminDashboard() {
    // Check admin authentication
    if (!adminAPI.isLoggedIn()) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load admin info
    loadAdminInfo();

    // Initialize components
    initializeSidebar();
    initializeLogout();
    initializeSearch();
    initializeFilters();

    // Load initial data
    loadDashboardData();
}

/**
 * Load admin information
 */
function loadAdminInfo() {
    const adminData = adminAPI.getAdminData();
    if (adminData) {
        document.getElementById('adminName').textContent = adminData.full_name || adminData.username;
        document.getElementById('adminRole').textContent = adminData.role || 'Administrator';
    }
}

/**
 * Initialize sidebar navigation
 */
function initializeSidebar() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.dashboard-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');

            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');

            // Load section-specific data
            loadSectionData(targetSection);
        });
    });
}

/**
 * Initialize logout functionality
 */
function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);
}

/**
 * Handle admin logout
 */
async function handleLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const originalText = logoutBtn.innerHTML;

    try {
        // Show loading state
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;

        // Call logout API
        await adminAPI.logout();

        // Clear admin state
        adminAPI.setLoginState(false);

        // Show success message
        MessageDisplay.success('Logged out successfully. Redirecting...');

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1500);

    } catch (error) {
        console.error('Logout error:', error);
        MessageDisplay.error('Error during logout. Please try again.');
        
        // Restore button state
        logoutBtn.innerHTML = originalText;
        logoutBtn.disabled = false;
    }
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

/**
 * Initialize filter functionality
 */
function initializeFilters() {
    const sessionFilter = document.getElementById('sessionFilter');
    if (sessionFilter) {
        sessionFilter.addEventListener('change', handleFilterChange);
    }
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        await Promise.all([
            loadStatistics(),
            loadRecentRegistrations(),
            loadRegistrations(),
            loadSessionStats()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        MessageDisplay.error('Failed to load dashboard data');
    }
}

/**
 * Load statistics
 */
async function loadStatistics() {
    try {
        const response = await registrationAPI.getStats();
        
        if (response.success && response.data) {
            updateStatistics(response.data);
        }
    } catch (error) {
        console.error('Failed to load statistics:', error);
    }
}

/**
 * Update statistics display
 */
function updateStatistics(stats) {
    // Total registrations
    const totalElement = document.getElementById('totalRegistrations');
    if (totalElement) {
        DataFormatter.animateCounter(totalElement, 0, stats.total_registrations);
    }

    // Recent registrations
    const recentElement = document.getElementById('recentRegistrations');
    if (recentElement) {
        DataFormatter.animateCounter(recentElement, 0, stats.recent_registrations);
    }

    // Update growth indicator
    const growthElement = document.getElementById('registrationGrowth');
    if (growthElement) {
        growthElement.textContent = stats.recent_registrations;
    }

    // Update capacity percentage
    const capacityElement = document.getElementById('capacityPercentage');
    if (capacityElement) {
        const percentage = Math.round((stats.total_registrations / 200) * 100);
        capacityElement.textContent = `${percentage}%`;
    }

    // Update registration count in sidebar
    const countElement = document.getElementById('registrationCount');
    if (countElement) {
        countElement.textContent = stats.total_registrations;
    }

    // Update last update time
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = new Date().toLocaleTimeString();
    }
}

/**
 * Load recent registrations
 */
async function loadRecentRegistrations() {
    const container = document.getElementById('recentRegistrationsList');
    
    try {
        const response = await registrationAPI.getRegistrations();
        
        if (response.success && response.data) {
            displayRecentRegistrations(response.data.slice(0, 5)); // Show last 5
        } else {
            container.innerHTML = '<p>No recent registrations found.</p>';
        }
    } catch (error) {
        console.error('Failed to load recent registrations:', error);
        container.innerHTML = '<p>Failed to load recent registrations.</p>';
    }
}

/**
 * Display recent registrations
 */
function displayRecentRegistrations(registrations) {
    const container = document.getElementById('recentRegistrationsList');
    
    if (registrations.length === 0) {
        container.innerHTML = '<p>No recent registrations found.</p>';
        return;
    }

    const html = registrations.map(reg => `
        <div class="recent-registration-item">
            <div class="registration-info">
                <h4>${reg.full_name}</h4>
                <p>${reg.email}</p>
                <span class="session-tag">${reg.session_choice}</span>
            </div>
            <div class="registration-time">
                ${DataFormatter.formatDate(reg.registration_date)}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Load all registrations
 */
async function loadRegistrations() {
    const tableBody = document.getElementById('registrationsTableBody');
    
    try {
        LoadingState.show(tableBody, 'Loading registrations...');
        
        const response = await registrationAPI.getRegistrations();
        
        if (response.success && response.data) {
            displayRegistrations(response.data);
        } else {
            tableBody.innerHTML = '<tr><td colspan="8">No registrations found.</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load registrations:', error);
        tableBody.innerHTML = '<tr><td colspan="8">Failed to load registrations.</td></tr>';
    }
}

/**
 * Display registrations in table
 */
function displayRegistrations(registrations) {
    const tableBody = document.getElementById('registrationsTableBody');
    
    if (registrations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">No registrations found.</td></tr>';
        return;
    }

    const html = registrations.map(reg => `
        <tr data-id="${reg.id}">
            <td>#${reg.id}</td>
            <td>${reg.full_name}</td>
            <td>${reg.email}</td>
            <td>${DataFormatter.formatPhone(reg.phone)}</td>
            <td>${reg.organization}</td>
            <td>
                <span class="session-tag">${DataFormatter.truncateText(reg.session_choice, 20)}</span>
            </td>
            <td>${DataFormatter.formatDate(reg.registration_date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewRegistration(${reg.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteRegistration(${reg.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = html;
}

/**
 * Load session statistics
 */
async function loadSessionStats() {
    try {
        const response = await registrationAPI.getStats();
        
        if (response.success && response.data && response.data.by_session) {
            displaySessionStats(response.data.by_session);
        }
    } catch (error) {
        console.error('Failed to load session stats:', error);
    }
}

/**
 * Display session statistics
 */
function displaySessionStats(sessionData) {
    const container = document.getElementById('sessionStats');
    
    const sessions = Object.entries(sessionData);
    
    if (sessions.length === 0) {
        container.innerHTML = '<p>No session data available.</p>';
        return;
    }

    const html = sessions.map(([session, count]) => `
        <div class="session-stat-item">
            <div class="session-name">${DataFormatter.truncateText(session, 25)}</div>
            <div class="session-bar">
                <div class="session-progress" style="width: ${(count / 50) * 100}%"></div>
            </div>
            <div class="session-count">${count} / 50</div>
        </div>
    `).join('');

    container.innerHTML = html;

    // Also update analytics section
    const chartContainer = document.getElementById('sessionChart');
    if (chartContainer) {
        chartContainer.innerHTML = html;
    }
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#registrationsTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const shouldShow = text.includes(searchTerm);
        row.style.display = shouldShow ? '' : 'none';
    });
}

/**
 * Handle filter changes
 */
function handleFilterChange(event) {
    const filterValue = event.target.value;
    const rows = document.querySelectorAll('#registrationsTableBody tr');

    rows.forEach(row => {
        if (!filterValue) {
            row.style.display = '';
        } else {
            const sessionCell = row.querySelector('.session-tag');
            if (sessionCell) {
                const shouldShow = sessionCell.textContent.includes(filterValue);
                row.style.display = shouldShow ? '' : 'none';
            }
        }
    });
}

/**
 * Load section-specific data
 */
function loadSectionData(section) {
    switch (section) {
        case 'overview':
            loadStatistics();
            loadRecentRegistrations();
            break;
        case 'registrations':
            loadRegistrations();
            break;
        case 'analytics':
            loadSessionStats();
            break;
        case 'export':
            // No specific data loading needed
            break;
    }
}

/**
 * View registration details
 */
function viewRegistration(id) {
    // For now, just highlight the row
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.classList.add('highlighted');
        setTimeout(() => {
            row.classList.remove('highlighted');
        }, 2000);
    }
    
    MessageDisplay.info(`Viewing registration #${id}`);
}

/**
 * Delete registration
 */
function deleteRegistration(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    // Get registration details
    const cells = row.querySelectorAll('td');
    const registrationDetails = {
        id: id,
        name: cells[1].textContent,
        email: cells[2].textContent,
        session: cells[5].textContent
    };

    // Show confirmation modal
    showDeleteModal(registrationDetails);
}

/**
 * Show delete confirmation modal
 */
function showDeleteModal(registration) {
    const modal = document.getElementById('deleteModal');
    const detailsContainer = document.getElementById('deleteRegistrationDetails');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    // Populate registration details
    detailsContainer.innerHTML = `
        <div class="registration-detail">
            <strong>ID:</strong> #${registration.id}
        </div>
        <div class="registration-detail">
            <strong>Name:</strong> ${registration.name}
        </div>
        <div class="registration-detail">
            <strong>Email:</strong> ${registration.email}
        </div>
        <div class="registration-detail">
            <strong>Session:</strong> ${registration.session}
        </div>
    `;

    // Set up confirm button
    confirmBtn.onclick = () => confirmDelete(registration.id);

    // Show modal
    modal.style.display = 'block';
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
}

/**
 * Confirm deletion
 */
async function confirmDelete(id) {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const originalText = confirmBtn.innerHTML;

    try {
        // Show loading state
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        confirmBtn.disabled = true;

        // Delete registration
        const response = await registrationAPI.deleteRegistration(id);

        if (response.success) {
            MessageDisplay.success('Registration deleted successfully');
            
            // Remove row from table
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.remove();
            }

            // Refresh statistics
            loadStatistics();
            loadSessionStats();
        } else {
            MessageDisplay.error(response.message || 'Failed to delete registration');
        }
    } catch (error) {
        console.error('Delete error:', error);
        MessageDisplay.error('Error deleting registration');
    } finally {
        // Close modal and restore button
        closeDeleteModal();
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
    }
}

/**
 * Export registrations as CSV
 */
async function exportCSV() {
    try {
        showLoadingOverlay('Preparing CSV export...');

        const response = await registrationAPI.exportCSV();

        if (response.success && response.blob) {
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `yaicess_registrations_${timestamp}.csv`;

            // Download file
            downloadFile(response.blob, filename);
            
            MessageDisplay.success('CSV exported successfully');
        } else {
            MessageDisplay.error('Failed to export CSV');
        }
    } catch (error) {
        console.error('Export error:', error);
        MessageDisplay.error('Error exporting CSV');
    } finally {
        hideLoadingOverlay();
    }
}

/**
 * Refresh registrations data
 */
function refreshRegistrations() {
    loadRegistrations();
    MessageDisplay.info('Registrations refreshed');
}

/**
 * Refresh all dashboard data
 */
function refreshData() {
    loadDashboardData();
    MessageDisplay.info('Dashboard data refreshed');
}

// Export functions for global access
window.viewRegistration = viewRegistration;
window.deleteRegistration = deleteRegistration;
window.closeDeleteModal = closeDeleteModal;
window.exportCSV = exportCSV;
window.refreshRegistrations = refreshRegistrations;
window.refreshData = refreshData;