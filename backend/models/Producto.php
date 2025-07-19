<?php
require_once '../config/database.php';
require_once '../utils/validator.php';

class Producto {
    private $conn;
    private $table_name = "productos";

    public $id;
    public $nombre;
    public $precio;
    public $descripcion;
    public $stock;
    public $activo;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear producto
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET nombre=:nombre, precio=:precio, descripcion=:descripcion, 
                      stock=:stock, activo=:activo";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->precio = htmlspecialchars(strip_tags($this->precio));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->stock = htmlspecialchars(strip_tags($this->stock));
        $this->activo = $this->activo ? 1 : 0;

        // Bind valores
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":activo", $this->activo);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Leer todos los productos
    public function read($activos_solo = false) {
        $query = "SELECT * FROM " . $this->table_name;
        if ($activos_solo) {
            $query .= " WHERE activo = 1";
        }
        $query .= " ORDER BY nombre ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Buscar producto por ID
    public function findById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->nombre = $row['nombre'];
            $this->precio = $row['precio'];
            $this->descripcion = $row['descripcion'];
            $this->stock = $row['stock'];
            $this->activo = $row['activo'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    // Actualizar producto
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET nombre=:nombre, precio=:precio, descripcion=:descripcion, 
                      stock=:stock, activo=:activo, updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->precio = htmlspecialchars(strip_tags($this->precio));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->stock = htmlspecialchars(strip_tags($this->stock));
        $this->activo = $this->activo ? 1 : 0;
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind valores
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Eliminar producto
    public function delete() {
        $query = "UPDATE " . $this->table_name . " SET activo = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Actualizar stock
    public function updateStock($cantidad) {
        $query = "UPDATE " . $this->table_name . " 
                  SET stock = stock - :cantidad, updated_at=CURRENT_TIMESTAMP
                  WHERE id = :id AND stock >= :cantidad";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":cantidad", $cantidad);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute() && $stmt->rowCount() > 0;
    }

    // Validar datos del producto
    public function validate() {
        try {
            Validator::required($this->nombre, 'nombre');
            Validator::required($this->precio, 'precio');
            Validator::numeric($this->precio, 'precio');
            Validator::numeric($this->stock, 'stock');
            Validator::minLength($this->nombre, 2, 'nombre');
            
            if ($this->precio <= 0) {
                throw new Exception("El precio debe ser mayor a 0");
            }
            
            if ($this->stock < 0) {
                throw new Exception("El stock no puede ser negativo");
            }
            
            return true;
        } catch (Exception $e) {
            throw $e;
        }
    }
}
?>
