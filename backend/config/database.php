<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Railway incluye el puerto en MYSQL_HOST
        $this->host = $_ENV['MYSQL_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['MYSQL_DATABASE'] ?? 'railway';
        $this->username = $_ENV['MYSQL_USER'] ?? 'root';
        $this->password = $_ENV['MYSQL_PASSWORD'] ?? '';
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";port=3306;dbname=" . $this->db_name . ";charset=utf8",
                $this->username, 
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode([
                "error" => true,
                "message" => "Error de conexión a la base de datos: " . $exception->getMessage()
            ]);
            exit();
        }
        
        return $this->conn;
    }
}
?>