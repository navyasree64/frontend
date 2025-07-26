<?php
/**
 * Database Setup and Installation Script
 * Sets up the database and initial data for YAICESS Conference System
 * YAICESS Solutions - Tech Conference Registration System
 */

echo "<h1>YAICESS Conference System - Database Setup</h1>\n";
echo "<style>body { font-family: Arial, sans-serif; margin: 20px; } .success { color: green; } .error { color: red; } .info { color: blue; }</style>\n";

// Database configuration
$host = "localhost";
$username = "root";
$password = "";
$database_name = "event_registration";

echo "<h2>Starting Database Setup...</h2>\n";

try {
    // Step 1: Connect to MySQL (without database)
    echo "<p class='info'>Step 1: Connecting to MySQL server...</p>\n";
    $conn = new mysqli($host, $username, $password);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    echo "<p class='success'>✅ Connected to MySQL server successfully!</p>\n";

    // Step 2: Create database
    echo "<p class='info'>Step 2: Creating database '$database_name'...</p>\n";
    $sql = "CREATE DATABASE IF NOT EXISTS $database_name";
    if ($conn->query($sql) === TRUE) {
        echo "<p class='success'>✅ Database '$database_name' created successfully!</p>\n";
    } else {
        throw new Exception("Error creating database: " . $conn->error);
    }

    // Step 3: Select database
    $conn->select_db($database_name);
    echo "<p class='success'>✅ Database '$database_name' selected!</p>\n";

    // Step 4: Create tables
    echo "<p class='info'>Step 3: Creating tables...</p>\n";
    
    // Read SQL schema file
    $schema_file = '../database/schema.sql';
    if (!file_exists($schema_file)) {
        throw new Exception("Schema file not found: $schema_file");
    }
    
    $sql_content = file_get_contents($schema_file);
    $sql_statements = array_filter(array_map('trim', explode(';', $sql_content)));
    
    $table_count = 0;
    foreach ($sql_statements as $sql) {
        if (!empty($sql) && !str_starts_with(trim($sql), '--')) {
            if ($conn->query($sql) === TRUE) {
                if (stripos($sql, 'CREATE TABLE') !== false) {
                    $table_count++;
                    preg_match('/CREATE TABLE.*?(\w+)/i', $sql, $matches);
                    $table_name = $matches[1] ?? 'unknown';
                    echo "<p class='success'>  ✅ Table '$table_name' created!</p>\n";
                }
            } else {
                // Skip errors for "already exists" situations
                if (stripos($conn->error, 'already exists') === false) {
                    echo "<p class='error'>  ❌ Error executing SQL: " . $conn->error . "</p>\n";
                }
            }
        }
    }
    
    echo "<p class='success'>✅ All tables created successfully!</p>\n";

    // Step 5: Insert default data
    echo "<p class='info'>Step 4: Inserting default data...</p>\n";
    
    // Check if admin user already exists
    $check_admin = $conn->query("SELECT COUNT(*) as count FROM admin_users WHERE username = 'admin'");
    $admin_exists = $check_admin->fetch_assoc()['count'] > 0;
    
    if (!$admin_exists) {
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        $insert_admin = "INSERT INTO admin_users (username, password, email, full_name) VALUES 
                        ('admin', '$admin_password', 'admin@yaicess.com', 'YAICESS Admin')";
        
        if ($conn->query($insert_admin) === TRUE) {
            echo "<p class='success'>  ✅ Default admin user created!</p>\n";
            echo "<p class='info'>  📝 Default admin credentials: admin / admin123</p>\n";
        } else {
            echo "<p class='error'>  ❌ Error creating admin user: " . $conn->error . "</p>\n";
        }
    } else {
        echo "<p class='info'>  ℹ️ Admin user already exists, skipping...</p>\n";
    }

    // Check if conference sessions already exist
    $check_sessions = $conn->query("SELECT COUNT(*) as count FROM conference_sessions");
    $sessions_exist = $check_sessions->fetch_assoc()['count'] > 0;
    
    if (!$sessions_exist) {
        $sessions = [
            ['AI and Machine Learning Trends', 'Dr. Sarah Chen', '09:00:00', '2025-08-15', 'Exploring the latest trends in AI and ML technology'],
            ['Cloud Computing Strategies', 'Mark Johnson', '11:00:00', '2025-08-15', 'Best practices for cloud migration and optimization'],
            ['Cybersecurity in Modern Apps', 'Lisa Rodriguez', '14:00:00', '2025-08-15', 'Security protocols for web and mobile applications'],
            ['DevOps and Automation', 'Alex Kumar', '16:00:00', '2025-08-15', 'Streamlining development with DevOps practices']
        ];
        
        foreach ($sessions as $session) {
            $insert_session = "INSERT INTO conference_sessions (session_name, speaker_name, session_time, session_date, description) VALUES 
                              ('" . $conn->real_escape_string($session[0]) . "', 
                               '" . $conn->real_escape_string($session[1]) . "', 
                               '$session[2]', '$session[3]', 
                               '" . $conn->real_escape_string($session[4]) . "')";
            
            if ($conn->query($insert_session) === TRUE) {
                echo "<p class='success'>  ✅ Session '$session[0]' added!</p>\n";
            } else {
                echo "<p class='error'>  ❌ Error adding session: " . $conn->error . "</p>\n";
            }
        }
    } else {
        echo "<p class='info'>  ℹ️ Conference sessions already exist, skipping...</p>\n";
    }

    // Step 6: Create indexes
    echo "<p class='info'>Step 5: Creating database indexes for optimization...</p>\n";
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_email ON registrations(email)",
        "CREATE INDEX IF NOT EXISTS idx_registration_date ON registrations(registration_date)",
        "CREATE INDEX IF NOT EXISTS idx_session_choice ON registrations(session_choice)",
        "CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username)"
    ];
    
    foreach ($indexes as $index_sql) {
        if ($conn->query($index_sql) === TRUE) {
            echo "<p class='success'>  ✅ Index created successfully!</p>\n";
        }
    }

    // Step 7: Verify installation
    echo "<p class='info'>Step 6: Verifying installation...</p>\n";
    
    $tables = ['registrations', 'admin_users', 'conference_sessions'];
    $all_tables_exist = true;
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "<p class='success'>  ✅ Table '$table' exists and is accessible!</p>\n";
        } else {
            echo "<p class='error'>  ❌ Table '$table' not found!</p>\n";
            $all_tables_exist = false;
        }
    }

    if ($all_tables_exist) {
        echo "<h2 class='success'>🎉 Installation Completed Successfully!</h2>\n";
        echo "<div style='background: #f0f8ff; padding: 15px; border-left: 4px solid #007cba; margin: 20px 0;'>\n";
        echo "<h3>What's Next?</h3>\n";
        echo "<ol>\n";
        echo "<li><strong>Admin Access:</strong> Login with username 'admin' and password 'admin123'</li>\n";
        echo "<li><strong>Security:</strong> Change the default admin password immediately</li>\n";
        echo "<li><strong>Testing:</strong> Run the test scripts in the /tests/ folder</li>\n";
        echo "<li><strong>Configuration:</strong> Update database credentials in /config/database.php if needed</li>\n";
        echo "</ol>\n";
        echo "</div>\n";
        
        echo "<h3>Database Summary:</h3>\n";
        echo "<ul>\n";
        echo "<li><strong>Database:</strong> $database_name</li>\n";
        echo "<li><strong>Tables:</strong> " . implode(', ', $tables) . "</li>\n";
        echo "<li><strong>Default Admin:</strong> admin / admin123</li>\n";
        echo "<li><strong>Conference Sessions:</strong> 4 default sessions loaded</li>\n";
        echo "</ul>\n";
        
    } else {
        echo "<h2 class='error'>❌ Installation Failed!</h2>\n";
        echo "<p>Some tables could not be created. Please check the error messages above.</p>\n";
    }

    $conn->close();

} catch (Exception $e) {
    echo "<h2 class='error'>❌ Installation Failed!</h2>\n";
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>\n";
    echo "<p>Please check your database configuration and try again.</p>\n";
}

echo "<hr>\n";
echo "<p><strong>Installation Log:</strong> " . date('Y-m-d H:i:s') . "</p>\n";
?>