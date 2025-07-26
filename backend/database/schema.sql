-- YAICESS Solutions - Tech Conference Registration Database Schema
-- Version: 1.0
-- Date: July 2025

-- Create database
CREATE DATABASE IF NOT EXISTS event_registration;
USE event_registration;

-- Table: registrations
-- Stores all conference registration data
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    session_choice VARCHAR(100) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: admin_users
-- Stores admin login credentials
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'moderator') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Table: conference_sessions
-- Stores available conference sessions/workshops
CREATE TABLE IF NOT EXISTS conference_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_name VARCHAR(100) NOT NULL,
    speaker_name VARCHAR(100) NOT NULL,
    session_time TIME NOT NULL,
    session_date DATE NOT NULL,
    max_capacity INT DEFAULT 50,
    current_registrations INT DEFAULT 0,
    description TEXT,
    status ENUM('active', 'cancelled', 'full') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password, email, full_name) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@yaicess.com', 'YAICESS Admin');

-- Insert default conference sessions
INSERT INTO conference_sessions (session_name, speaker_name, session_time, session_date, description) VALUES 
('AI and Machine Learning Trends', 'Dr. Sarah Chen', '09:00:00', '2025-08-15', 'Exploring the latest trends in AI and ML technology'),
('Cloud Computing Strategies', 'Mark Johnson', '11:00:00', '2025-08-15', 'Best practices for cloud migration and optimization'),
('Cybersecurity in Modern Apps', 'Lisa Rodriguez', '14:00:00', '2025-08-15', 'Security protocols for web and mobile applications'),
('DevOps and Automation', 'Alex Kumar', '16:00:00', '2025-08-15', 'Streamlining development with DevOps practices');

-- Create indexes for better performance
CREATE INDEX idx_email ON registrations(email);
CREATE INDEX idx_registration_date ON registrations(registration_date);
CREATE INDEX idx_session_choice ON registrations(session_choice);
CREATE INDEX idx_admin_username ON admin_users(username);