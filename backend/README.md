# YAICESS Solutions - Tech Conference Registration Backend

## 📋 Overview

This is the complete PHP backend system for the YAICESS Solutions Tech Conference registration website. It provides a robust, secure, and scalable solution for managing conference registrations with admin dashboard functionality.

## 🏗️ Architecture

```
backend/
├── config/                 # Database configuration
├── classes/               # PHP classes (OOP approach)
├── api/                   # REST API endpoints
├── includes/              # Helper functions and utilities
├── database/              # SQL schema and migrations
├── tests/                 # Unit testing scripts
├── install/               # Installation and setup scripts
└── README.md             # This documentation
```

## 🚀 Features

### Core Functionality
- ✅ **User Registration**: Complete form processing with validation
- ✅ **Admin Authentication**: Secure login system with session management
- ✅ **CRUD Operations**: Full Create, Read, Update, Delete for registrations
- ✅ **Data Export**: CSV export functionality for admin
- ✅ **API Endpoints**: RESTful APIs for all operations
- ✅ **Security**: SQL injection prevention, input sanitization, CSRF protection

### Technical Features
- ✅ **Object-Oriented PHP**: Clean, maintainable code structure
- ✅ **Prepared Statements**: SQL injection protection
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **Error Handling**: Comprehensive error logging and handling
- ✅ **Session Management**: Secure admin session handling
- ✅ **Unit Testing**: Complete test suite for quality assurance

## 📊 Database Schema

### Tables

#### `registrations`
| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK, AI) | Unique registration ID |
| full_name | VARCHAR(100) | Attendee's full name |
| email | VARCHAR(100) | Email address (unique) |
| phone | VARCHAR(15) | Contact number |
| organization | VARCHAR(100) | Company/Organization |
| session_choice | VARCHAR(100) | Selected conference session |
| registration_date | TIMESTAMP | Auto-generated timestamp |
| status | ENUM | 'active' or 'cancelled' |

#### `admin_users`
| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK, AI) | Unique admin ID |
| username | VARCHAR(50) | Admin username (unique) |
| password | VARCHAR(255) | Hashed password |
| email | VARCHAR(100) | Admin email |
| full_name | VARCHAR(100) | Admin full name |
| role | ENUM | 'admin' or 'moderator' |
| last_login | TIMESTAMP | Last login timestamp |
| status | ENUM | 'active' or 'inactive' |

#### `conference_sessions`
| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK, AI) | Unique session ID |
| session_name | VARCHAR(100) | Session title |
| speaker_name | VARCHAR(100) | Speaker name |
| session_time | TIME | Session start time |
| session_date | DATE | Session date |
| max_capacity | INT | Maximum attendees |
| description | TEXT | Session description |
| status | ENUM | 'active', 'cancelled', or 'full' |

## 🛠️ Installation Guide

### Prerequisites
- **XAMPP** (or similar LAMP/WAMP stack)
- **PHP 7.3+**
- **MySQL 5.7+**
- **Web browser** for testing

### Step 1: Setup XAMPP
1. Download and install XAMPP
2. Start Apache and MySQL services
3. Ensure ports 80 (Apache) and 3306 (MySQL) are available

### Step 2: Deploy Backend Files
1. Copy the entire `backend/` folder to your web server directory:
   ```
   # For XAMPP on Windows
   C:\xampp\htdocs\yaicess-backend\

   # For XAMPP on Linux/Mac
   /opt/lampp/htdocs/yaicess-backend/
   ```

### Step 3: Run Installation Script
1. Open your web browser
2. Navigate to: `http://localhost/yaicess-backend/install/setup.php`
3. Follow the installation wizard
4. Verify all steps complete successfully

### Step 4: Configuration
1. Update database credentials in `config/database.php` if needed:
   ```php
   private $host = "localhost";
   private $db_name = "event_registration";
   private $username = "root";
   private $password = "";
   ```

### Step 5: Testing
1. Run unit tests: `http://localhost/yaicess-backend/tests/test_registration.php`
2. Run admin tests: `http://localhost/yaicess-backend/tests/test_admin.php`
3. Verify all tests pass

## 🔌 API Endpoints

### Registration APIs

#### Register New Attendee
```http
POST /api/register.php
Content-Type: application/json

{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "organization": "Tech Corp",
    "session_choice": "AI and Machine Learning Trends"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Registration successful!",
    "data": {
        "registration_id": 123,
        "full_name": "John Doe",
        "email": "john@example.com",
        "session_choice": "AI and Machine Learning Trends"
    }
}
```

### Admin APIs

#### Admin Login
```http
POST /api/admin_login.php
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

#### Get All Registrations
```http
GET /api/get_registrations.php
```

#### Get Dashboard Statistics
```http
GET /api/get_stats.php
```

#### Delete Registration
```http
POST /api/delete_registration.php
Content-Type: application/json

{
    "id": 123
}
```

#### Export CSV
```http
GET /api/export_csv.php
```

#### Admin Logout
```http
POST /api/admin_logout.php
```

## 🔒 Security Features

### Input Validation
- Server-side validation for all inputs
- Email format validation
- Phone number format validation
- Required field validation
- Length restrictions

### SQL Injection Prevention
- Prepared statements for all database queries
- Input sanitization using `htmlspecialchars()`
- Real escape string for dynamic queries

### Session Security
- Secure session management
- Session timeout handling
- CSRF token protection
- Session hijacking prevention

### Authentication
- Secure password hashing using `password_hash()`
- Password verification using `password_verify()`
- Session-based authentication
- Role-based access control

## 🧪 Testing

### Running Tests

#### Registration Tests
```bash
# Via browser
http://localhost/yaicess-backend/tests/test_registration.php

# Expected output: All tests should pass
✅ PASS: Registration object creation
✅ PASS: Valid registration data
✅ PASS: Invalid email validation
...
```

#### Admin Tests
```bash
# Via browser
http://localhost/yaicess-backend/tests/test_admin.php

# Expected output: All tests should pass
✅ PASS: Admin object creation
✅ PASS: Valid admin data
✅ PASS: Password hash verification
...
```

### Test Coverage
- ✅ Object creation and initialization
- ✅ Data validation (all fields)
- ✅ Database operations (CRUD)
- ✅ Authentication and authorization
- ✅ Session management
- ✅ Security functions
- ✅ Utility functions

## 📝 Usage Examples

### Frontend Integration

#### JavaScript Registration Form
```javascript
// Registration form submission
async function submitRegistration(formData) {
    try {
        const response = await fetch('/backend/api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirect to success page
            window.location.href = 'success.html';
        } else {
            // Display errors
            displayErrors(result.errors);
        }
    } catch (error) {
        console.error('Registration failed:', error);
    }
}
```

#### JavaScript Admin Dashboard
```javascript
// Fetch registrations for admin dashboard
async function loadRegistrations() {
    try {
        const response = await fetch('/backend/api/get_registrations.php');
        const result = await response.json();
        
        if (result.success) {
            displayRegistrations(result.data);
        } else {
            console.error('Failed to load registrations:', result.message);
        }
    } catch (error) {
        console.error('Error loading registrations:', error);
    }
}

// Admin login
async function adminLogin(username, password) {
    try {
        const response = await fetch('/backend/api/admin_login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            displayError('Invalid credentials');
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: Connection failed: Access denied for user 'root'@'localhost'
```
**Solution:** Check MySQL credentials in `config/database.php`

#### Permission Denied
```
Error: Permission denied
```
**Solution:** Ensure proper file permissions on the backend folder

#### Session Not Working
```
Error: Unauthorized access
```
**Solution:** Check if sessions are enabled in PHP configuration

#### API Returns 500 Error
**Solution:** Check PHP error logs for detailed error information

### Debug Mode
Enable error reporting for development:
```php
// Add to top of PHP files for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📈 Performance Optimization

### Database Optimization
- Indexed fields for faster queries
- Prepared statements for security and performance
- Connection pooling for concurrent requests

### Caching
- Session-based caching for admin data
- Query result caching for statistics

### Security Best Practices
- Input validation and sanitization
- CSRF protection
- SQL injection prevention
- Secure session management

## 🔄 Maintenance

### Regular Tasks
1. **Database Backup**: Regular backups of registration data
2. **Log Monitoring**: Check error logs for issues
3. **Security Updates**: Keep PHP and MySQL updated
4. **Performance Monitoring**: Monitor response times and database performance

### Scaling Considerations
- Database indexing for large datasets
- API rate limiting for high traffic
- Load balancing for multiple servers
- Database clustering for high availability

## 🤝 Support

For technical support or questions:
- **Email**: admin@yaicess.com
- **Documentation**: This README file
- **Testing**: Use provided test scripts
- **Logs**: Check PHP error logs for debugging

## 📄 License

This project is developed for YAICESS Solutions Tech Conference. All rights reserved.

---

**Version**: 1.0  
**Last Updated**: July 2025  
**Author**: YAICESS Solutions Development Team