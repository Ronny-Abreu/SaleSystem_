<?php
class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Detectar entorno de forma más confiable
        if ($this->isLocalEnvironment()) {
            // Configuración para desarrollo local (XAMPP)
            $this->host = 'localhost';
            $this->port = '3308';
            $this->db_name = 'salesystem';
            $this->username = 'root';
            $this->password = '';
            
            error_log("🏠 Entorno LOCAL detectado");
        } else {
            // Configuración para producción
            $this->loadProductionConfig();
            error_log("🌐 Entorno PRODUCCIÓN detectado");
        }
    }

    private function isLocalEnvironment() {
        // Verificar múltiples indicadores de entorno local
        $local_indicators = [
            // Verificar host
            isset($_SERVER['HTTP_HOST']) && (
                $_SERVER['HTTP_HOST'] === 'localhost' ||
                strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0 ||
                $_SERVER['HTTP_HOST'] === '127.0.0.1' ||
                strpos($_SERVER['HTTP_HOST'], '127.0.0.1:') === 0
            ),
            // Verificar server name
            isset($_SERVER['SERVER_NAME']) && (
                $_SERVER['SERVER_NAME'] === 'localhost' ||
                $_SERVER['SERVER_NAME'] === '127.0.0.1'
            ),
            // Verificar si NO hay variables de entorno de producción
            empty($_ENV['MYSQL_URL']) && empty(getenv('MYSQL_URL')) && 
            empty($_ENV['MYSQL_PRIVATE_URL']) && empty(getenv('MYSQL_PRIVATE_URL')),
            // Verificar si estamos en Windows (típico de desarrollo local)
            stripos(PHP_OS, 'WIN') === 0
        ];
        
        // Si cualquiera de estos es verdadero, es local
        return array_reduce($local_indicators, function($carry, $indicator) {
            return $carry || $indicator;
        }, false);
    }

    private function loadProductionConfig() {
        // Para Railway y otros servicios
        $mysql_url = $_ENV['MYSQL_URL'] ?? $_ENV['MYSQL_PRIVATE_URL'] ?? 
                     getenv('MYSQL_URL') ?? getenv('MYSQL_PRIVATE_URL') ?? null;
        
        if ($mysql_url) {
            $url_parts = parse_url($mysql_url);
            $this->host = $url_parts['host'];
            $this->port = $url_parts['port'] ?? 3306;
            $this->db_name = ltrim($url_parts['path'], '/');
            $this->username = $url_parts['user'];
            $this->password = $url_parts['pass'] ?? '';
        } else {
            // Fallback
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
            http_response_code(500);
            echo json_encode([
                "error" => true,
                "message" => "Error de conexión a la base de datos: " . $exception->getMessage(),
                "debug" => [
                    "host" => !empty($this->host) ? $this->host : false,
                    "port" => !empty($this->port) ? $this->port : false,
                    "database" => !empty($this->db_name) ? $this->db_name : false,
                    "username" => !empty($this->username) ? $this->username : false,
                    "is_local" => $this->isLocalEnvironment()
                ]
            ]);
            exit();
        }
        
        return $this->conn;
    }
}
?>
