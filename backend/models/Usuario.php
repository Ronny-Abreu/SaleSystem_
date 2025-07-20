<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validator.php';

class Usuario {
    private $conn;
    private $table_name = "usuarios";

    public $id;
    public $username;
    public $password;
    public $nombre;
    public $email;
    public $rol;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Autenticar usuario
    public function authenticate($username, $password) {
        $query = "SELECT id, username, password, nombre, email, rol, activo 
                  FROM " . $this->table_name . " 
                  WHERE username = :username AND activo = 1 LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($password, $row['password'])) {
                $this->id = $row['id'];
                $this->username = $row['username'];
                $this->nombre = $row['nombre'];
                $this->email = $row['email'];
                $this->rol = $row['rol'];
                $this->activo = $row['activo'];
                return true;
            }
        }
        
        return false;
    }

    // Buscar usuario por ID
    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->nombre = $row['nombre'];
            $this->email = $row['email'];
            $this->rol = $row['rol'];
            $this->activo = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }

    // Crear usuario
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET username=:username, password=:password, nombre=:nombre, 
                      email=:email, rol=:rol, activo=:activo";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->rol = htmlspecialchars(strip_tags($this->rol));
        $this->activo = $this->activo ? 1 : 0;

        // Hash de la contraseña
        $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

        // Bind valores
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":rol", $this->rol);
        $stmt->bindParam(":activo", $this->activo);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Validar datos del usuario
    public function validate() {
        try {
            Validator::required($this->username, 'username');
            Validator::required($this->password, 'password');
            Validator::required($this->nombre, 'nombre');
            Validator::minLength($this->username, 3, 'username');
            Validator::minLength($this->password, 6, 'password');
            
            if (!empty($this->email)) {
                Validator::email($this->email);
            }
            
            if (!in_array($this->rol, ['admin', 'vendedor'])) {
                throw new Exception("Rol inválido");
            }
            
            return true;
        } catch (Exception $e) {
            throw $e;
        }
    }
}
?>
