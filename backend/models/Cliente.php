<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validator.php';

class Cliente {
    private $conn;
    private $table_name = "clientes";

    public $id;
    public $codigo;
    public $nombre;
    public $telefono;
    public $email;
    public $direccion;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Generar código de cliente de forma atómica
    private function generarSiguienteCodigo() {
        $maxIntentos = 10;
        $intento = 0;
        
        while ($intento < $maxIntentos) {
            try {
                $this->conn->beginTransaction();
                
                $query = "SELECT codigo FROM " . $this->table_name . " 
                         WHERE codigo LIKE 'CLI-%' 
                         ORDER BY CAST(SUBSTRING(codigo, 5) AS UNSIGNED) DESC 
                         LIMIT 1 FOR UPDATE";
                $stmt = $this->conn->prepare($query);
                $stmt->execute();
                
                $ultimoNumero = 0;
                if ($stmt->rowCount() > 0) {
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    $match = preg_match('/CLI-(\d+)/', $row['codigo'], $matches);
                    if ($match && isset($matches[1])) {
                        $ultimoNumero = (int)$matches[1];
                    }
                }
                
                $siguienteNumero = $ultimoNumero + 1;
                $codigo = 'CLI-' . str_pad($siguienteNumero, 3, '0', STR_PAD_LEFT);
                
                $verificarQuery = "SELECT id FROM " . $this->table_name . " WHERE codigo = :codigo LIMIT 1";
                $verificarStmt = $this->conn->prepare($verificarQuery);
                $verificarStmt->bindParam(":codigo", $codigo);
                $verificarStmt->execute();
                
                if ($verificarStmt->rowCount() > 0) {
                    $this->conn->rollBack();
                    $intento++;
                    continue;
                }
                
                $this->conn->commit();
                
                return $codigo;
                
            } catch (Exception $e) {
                if ($this->conn->inTransaction()) {
                    $this->conn->rollBack();
                }
                
                if (strpos($e->getMessage(), 'Duplicate entry') !== false || 
                    strpos($e->getMessage(), 'UNIQUE constraint') !== false) {
                    $intento++;
                    continue;
                }
                
                throw $e;
            }
        }
        
        throw new Exception("No se pudo generar un código único después de varios intentos");
    }

    // Crear cliente
    public function create() {
        if (empty($this->codigo)) {
            $this->codigo = $this->generarSiguienteCodigo();
        }
        
        $query = "INSERT INTO " . $this->table_name . " 
                  SET codigo=:codigo, nombre=:nombre, telefono=:telefono, 
                      email=:email, direccion=:direccion";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->codigo = htmlspecialchars(strip_tags($this->codigo));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));

        // Bind valores
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":direccion", $this->direccion);

        try {
            if($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch (PDOException $e) {
            if ((strpos($e->getMessage(), 'Duplicate entry') !== false || 
                 strpos($e->getMessage(), 'UNIQUE constraint') !== false) &&
                strpos($e->getMessage(), 'codigo') !== false) {
                $this->codigo = $this->generarSiguienteCodigo();
                $stmt->bindParam(":codigo", $this->codigo);
                
                if($stmt->execute()) {
                    $this->id = $this->conn->lastInsertId();
                    return true;
                }
            }
            throw $e;
        }
    }

    // Leer todos los clientes
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Buscar cliente por código
    public function findByCodigo($codigo) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE codigo = :codigo LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":codigo", $codigo);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->codigo = $row['codigo'];
            $this->nombre = $row['nombre'];
            $this->telefono = $row['telefono'];
            $this->email = $row['email'];
            $this->direccion = $row['direccion'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    // Buscar cliente por ID
    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->codigo = $row['codigo'];
            $this->nombre = $row['nombre'];
            $this->telefono = $row['telefono'];
            $this->email = $row['email'];
            $this->direccion = $row['direccion'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    // Actualizar cliente
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET nombre=:nombre, telefono=:telefono, email=:email, 
                      direccion=:direccion, updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind valores
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Eliminar cliente
    public function delete() {
        require_once __DIR__ . '/Factura.php';
        $factura = new Factura($this->conn);

        try {
            $this->conn->beginTransaction();

            if ($factura->hasPendingInvoices($this->id)) {
                throw new Exception("No se puede eliminar el cliente porque tiene facturas pendientes.");
            }

            // Eliminar todas las facturas del cliente (pagadas o anuladas)
            $factura->deleteByClientId($this->id);

            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            $this->id = htmlspecialchars(strip_tags($this->id));
            $stmt->bindParam(":id", $this->id);

            if (!$stmt->execute()) {
                throw new Exception("Error al eliminar el cliente");
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    public function validate() {
        try {
            if (!empty($this->codigo)) {
                Validator::minLength($this->codigo, 3, 'código');
            }
            Validator::required($this->nombre, 'nombre');
            Validator::minLength($this->nombre, 2, 'nombre');
            
            if (!empty($this->email)) {
                Validator::email($this->email);
            }
            
            return true;
        } catch (Exception $e) {
            throw $e;
        }
    }
}
?>
