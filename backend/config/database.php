<?php
/**
 * Database Configuration
 * YAICESS Solutions - Tech Conference Registration System
 * Version: 1.0
 */

class Database {
    private $host = "localhost";
    private $db_name = "event_registration";
    private $username = "root";
    private $password = "";
    public $conn;

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
            
            // Check connection
            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
            
            // Set charset to utf8
            $this->conn->set_charset("utf8");
            
        } catch(Exception $e) {
            echo "Database connection error: " . $e->getMessage();
        }
        
        return $this->conn;
    }

    /**
     * Close database connection
     */
    public function closeConnection() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}

// Database connection function for procedural style
function getDatabaseConnection() {
    $database = new Database();
    return $database->getConnection();
}
?>