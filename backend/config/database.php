<?php
class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Si existe MYSQL_URL, úsala (Railway genera esto automáticamente)
        $mysql_url = $_ENV['MYSQL_URL'] ?? $_ENV['MYSQL_PRIVATE_URL'] ?? getenv('MYSQL_URL') ?? getenv('MYSQL_PRIVATE_URL') ?? null;
        
        if ($mysql_url) {
            $url_parts = parse_url($mysql_url);
            $this->host = $url_parts['host'];
            $this->port = $url_parts['port'] ?? 3306;
            $this->db_name = ltrim($url_parts['path'], '/');
            $this->username = $url_parts['user'];
            $this->password = $url_parts['pass'] ?? '';
        } else {
            // Intenta múltiples formatos de variables de entorno
            $this->host = $_ENV['DB_HOST'] ?? $_ENV['MYSQL_HOST'] ?? getenv('DB_HOST') ?? getenv('MYSQL_HOST') ?? 'localhost';
            $this->port = $_ENV['DB_PORT'] ?? $_ENV['MYSQL_PORT'] ?? getenv('DB_PORT') ?? getenv('MYSQL_PORT') ?? '3306';
            $this->db_name = $_ENV['DB_NAME'] ?? $_ENV['MYSQL_DATABASE'] ?? getenv('DB_NAME') ?? getenv('MYSQL_DATABASE') ?? 'railway';
            $this->username = $_ENV['DB_USERNAME'] ?? $_ENV['MYSQL_USER'] ?? getenv('DB_USERNAME') ?? getenv('MYSQL_USER') ?? 'root';
            $this->password = $_ENV['DB_PASSWORD'] ?? $_ENV['MYSQL_PASSWORD'] ?? getenv('DB_PASSWORD') ?? getenv('MYSQL_PASSWORD') ?? '';
        }
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            // Log de debug (remover después)
            error_log("Conectando a: host={$this->host}, port={$this->port}, db={$this->db_name}, user={$this->username}");
            
            // DSN más específico para Railway
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
            
            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
                    PDO::ATTR_TIMEOUT => 30,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch(PDOException $exception) {
            // Log del error completo
            error_log("Error de conexión: " . $exception->getMessage());
            error_log("DSN usado: " . $dsn);
            
            http_response_code(500);
            echo json_encode([
                "error" => true,
                "message" => "Error de conexión a la base de datos: " . $exception->getMessage(),
                "debug" => [
                    "host" => $this->host,
                    "port" => $this->port,
                    "database" => $this->db_name,
                    "username" => $this->username
                ]
            ]);
            exit();
        }
        
        return $this->conn;
    }
}
?>