<?php
class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Railway proporciona host y puerto por separado
        $this->host = $_ENV['MYSQL_HOST'] ?? 'localhost';
        $this->port = $_ENV['MYSQL_PORT'] ?? '3306';
        $this->db_name = $_ENV['MYSQL_DATABASE'] ?? 'railway';
        $this->username = $_ENV['MYSQL_USER'] ?? 'root';
        $this->password = $_ENV['MYSQL_PASSWORD'] ?? '';
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            // Usar host:port explícitamente para Railway
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8";
            
            $this->conn = new PDO(
                $dsn,
                $this->username, 
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
                ]
            );
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