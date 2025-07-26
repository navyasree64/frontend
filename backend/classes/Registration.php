<?php
/**
 * Registration Class
 * Handles all registration-related database operations
 * YAICESS Solutions - Tech Conference Registration System
 */

require_once '../config/database.php';

class Registration {
    private $conn;
    private $table_name = "registrations";

    // Registration properties
    public $id;
    public $full_name;
    public $email;
    public $phone;
    public $organization;
    public $session_choice;
    public $registration_date;
    public $status;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Create new registration
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 (full_name, email, phone, organization, session_choice) 
                 VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        
        if (!$stmt) {
            return false;
        }

        // Sanitize input
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->organization = htmlspecialchars(strip_tags($this->organization));
        $this->session_choice = htmlspecialchars(strip_tags($this->session_choice));

        // Bind parameters
        $stmt->bind_param("sssss", 
            $this->full_name, 
            $this->email, 
            $this->phone, 
            $this->organization, 
            $this->session_choice
        );

        if ($stmt->execute()) {
            $this->id = $this->conn->insert_id;
            return true;
        }

        return false;
    }

    /**
     * Read all registrations
     */
    public function read() {
        $query = "SELECT id, full_name, email, phone, organization, session_choice, 
                         registration_date, status 
                  FROM " . $this->table_name . " 
                  WHERE status = 'active' 
                  ORDER BY registration_date DESC";

        $result = $this->conn->query($query);
        return $result;
    }

    /**
     * Read single registration by ID
     */
    public function readOne() {
        $query = "SELECT id, full_name, email, phone, organization, session_choice, 
                         registration_date, status 
                  FROM " . $this->table_name . " 
                  WHERE id = ? AND status = 'active'";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);
        $stmt->execute();

        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        if ($row) {
            $this->full_name = $row['full_name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->organization = $row['organization'];
            $this->session_choice = $row['session_choice'];
            $this->registration_date = $row['registration_date'];
            $this->status = $row['status'];
            return true;
        }

        return false;
    }

    /**
     * Update registration
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET full_name = ?, email = ?, phone = ?, 
                      organization = ?, session_choice = ? 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->organization = htmlspecialchars(strip_tags($this->organization));
        $this->session_choice = htmlspecialchars(strip_tags($this->session_choice));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind parameters
        $stmt->bind_param("sssssi", 
            $this->full_name, 
            $this->email, 
            $this->phone, 
            $this->organization, 
            $this->session_choice, 
            $this->id
        );

        return $stmt->execute();
    }

    /**
     * Delete registration (soft delete)
     */
    public function delete() {
        $query = "UPDATE " . $this->table_name . " 
                  SET status = 'cancelled' 
                  WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);

        return $stmt->execute();
    }

    /**
     * Check if email already exists
     */
    public function emailExists() {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE email = ? AND status = 'active'";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->email);
        $stmt->execute();

        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }

    /**
     * Get registration count
     */
    public function getCount() {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " 
                  WHERE status = 'active'";

        $result = $this->conn->query($query);
        $row = $result->fetch_assoc();
        return $row['total'];
    }

    /**
     * Get registrations by session
     */
    public function getBySession($session_name) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " 
                  WHERE session_choice = ? AND status = 'active'";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $session_name);
        $stmt->execute();

        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        return $row['total'];
    }

    /**
     * Validate registration data
     */
    public function validate() {
        $errors = [];

        // Full name validation
        if (empty($this->full_name) || strlen($this->full_name) < 2) {
            $errors[] = "Full name is required and must be at least 2 characters.";
        }

        // Email validation
        if (empty($this->email) || !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Valid email address is required.";
        }

        // Phone validation
        if (empty($this->phone) || !preg_match("/^[0-9+\-\s]{10,15}$/", $this->phone)) {
            $errors[] = "Valid phone number is required (10-15 digits).";
        }

        // Organization validation
        if (empty($this->organization)) {
            $errors[] = "Organization is required.";
        }

        // Session choice validation
        if (empty($this->session_choice)) {
            $errors[] = "Session choice is required.";
        }

        return $errors;
    }
}
?>