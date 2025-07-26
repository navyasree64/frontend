<?php
/**
 * Admin Class
 * Handles admin authentication and operations
 * YAICESS Solutions - Tech Conference Registration System
 */

require_once '../config/database.php';

class Admin {
    private $conn;
    private $table_name = "admin_users";

    // Admin properties
    public $id;
    public $username;
    public $password;
    public $email;
    public $full_name;
    public $role;
    public $status;
    public $last_login;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Admin login authentication
     */
    public function login($username, $password) {
        $query = "SELECT id, username, password, email, full_name, role, status 
                  FROM " . $this->table_name . " 
                  WHERE username = ? AND status = 'active'";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $username);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user && password_verify($password, $user['password'])) {
            $this->id = $user['id'];
            $this->username = $user['username'];
            $this->email = $user['email'];
            $this->full_name = $user['full_name'];
            $this->role = $user['role'];
            $this->status = $user['status'];

            // Update last login
            $this->updateLastLogin();

            return true;
        }

        return false;
    }

    /**
     * Update last login timestamp
     */
    private function updateLastLogin() {
        $query = "UPDATE " . $this->table_name . " 
                  SET last_login = NOW() 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);
        $stmt->execute();
    }

    /**
     * Create new admin user
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 (username, password, email, full_name, role) 
                 VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);

        // Hash password
        $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

        // Sanitize input
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->role = htmlspecialchars(strip_tags($this->role));

        $stmt->bind_param("sssss", 
            $this->username, 
            $hashed_password, 
            $this->email, 
            $this->full_name, 
            $this->role
        );

        return $stmt->execute();
    }

    /**
     * Check if username exists
     */
    public function usernameExists() {
        $query = "SELECT id FROM " . $this->table_name . " WHERE username = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->username);
        $stmt->execute();

        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }

    /**
     * Get admin profile
     */
    public function getProfile() {
        $query = "SELECT username, email, full_name, role, last_login 
                  FROM " . $this->table_name . " 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);
        $stmt->execute();

        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    /**
     * Change password
     */
    public function changePassword($new_password) {
        $query = "UPDATE " . $this->table_name . " 
                  SET password = ? 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt->bind_param("si", $hashed_password, $this->id);

        return $stmt->execute();
    }

    /**
     * Validate admin data
     */
    public function validate() {
        $errors = [];

        // Username validation
        if (empty($this->username) || strlen($this->username) < 3) {
            $errors[] = "Username is required and must be at least 3 characters.";
        }

        // Password validation
        if (empty($this->password) || strlen($this->password) < 6) {
            $errors[] = "Password is required and must be at least 6 characters.";
        }

        // Email validation
        if (empty($this->email) || !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Valid email address is required.";
        }

        // Full name validation
        if (empty($this->full_name)) {
            $errors[] = "Full name is required.";
        }

        return $errors;
    }
}
?>