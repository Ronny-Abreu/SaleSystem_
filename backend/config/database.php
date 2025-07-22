<?php
class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Detectar entorno
        if ($this->isLocalEnvironment()) {
            // Configuración hardcodeada para desarrollo local (XAMPP)
            $this->host = 'localhost';
            $this->port = '3308';
            $this->db_name = 'salesystem'; //
            $this->username = 'root';
            $this->password = ''; //
            
            error_log("🏠 Usando configuración LOCAL");
        } else {
            // Configuración para producción
            $this->loadProductionConfig();
            error_log("🌐 Usando configuración PRODUCCIÓN");
        }
    }

    private function isLocalEnvironment() {
        return (
            (isset($_SERVER['HTTP_HOST']) && (
                $_SERVER['HTTP_HOST'] === 'localhost' ||
                strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0 ||
                $_SERVER['HTTP_HOST'] === '127.0.0.1' ||
                strpos($_SERVER['HTTP_HOST'], '127.0.0.1:') === 0
            )) ||
            (isset($_SERVER['SERVER_NAME']) && (
                $_SERVER['SERVER_NAME'] === 'localhost' ||
                $_SERVER['SERVER_NAME'] === '127.0.0.1'
            )) ||
            (!isset($_ENV['MYSQL_URL']) && !getenv('MYSQL_URL'))
        );
    }

    private function loadProductionConfig() {
        // Para producción (Railway, etc.)
        $mysql_url = $_ENV['MYSQL_URL'] ?? $_ENV['MYSQL_PRIVATE_URL'] ?? getenv('MYSQL_URL') ?? getenv('MYSQL_PRIVATE_URL') ?? null;
        
        if ($mysql_url) {
            $url_parts = parse_url($mysql_url);
            $this->host = $url_parts['host'];
            $this->port = $url_parts['port'] ?? 3306;
            $this->db_name = ltrim($url_parts['path'], '/');
            $this->username = $url_parts['user'];
            $this->password = $url_parts['pass'] ?? '';
        } else {
            // Fallback para otras configuraciones de producción
            $this->host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'localhost';
            $this->port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '3306';
            $this->db_name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 'railway';
            $this->username = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?? 'root';
            $this->password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? '';
        }
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            error_log("=== INTENTO DE CONEXIÓN ===");
            error_log("Host: {$this->host}");
            error_log("Puerto: {$this->port}");
            error_log("Base de datos: {$this->db_name}");
            error_log("Usuario: {$this->username}");
            error_log("Entorno: " . ($this->isLocalEnvironment() ? 'LOCAL' : 'PRODUCCIÓN'));
            
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
            
            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
                    PDO::ATTR_TIMEOUT => 10,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
            
            error_log("✅ Conexión exitosa");
            
        } catch(PDOException $exception) {
            error_log("❌ Error de conexión: " . $exception->getMessage());
            
            http_response_code(500);
            echo json_encode([
                "error" => true,
                "message" => "Error de conexión a la base de datos: " . $exception->getMessage(),
                "debug" => [
                    "host" => $this->host,
                    "port" => $this->port,
                    "database" => $this->db_name,
                    "username" => $this->username,
                    "is_local" => $this->isLocalEnvironment()
                ]
            ]);
            exit();
        }
        
        return $this->conn;
    }
}
?>
