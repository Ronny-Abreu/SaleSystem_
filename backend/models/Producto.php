<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validator.php';

class Producto {
    private $conn;
    private $table_name = "productos";

    public $id;
    public $nombre;
    public $precio;
    public $descripcion;
    public $stock;
    public $activo;
    public $categoria_id;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Crear producto nuevo
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET nombre=:nombre, precio=:precio, descripcion=:descripcion, 
                      stock=:stock, activo=:activo, categoria_id=:categoria_id";

        $stmt = $this->conn->prepare($query);

        // Limpiar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->precio = htmlspecialchars(strip_tags($this->precio));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->stock = htmlspecialchars(strip_tags($this->stock));
        $this->activo = $this->activo ? 1 : 0;
        $this->categoria_id = $this->categoria_id ? htmlspecialchars(strip_tags($this->categoria_id)) : null;

        // Bind valores
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":categoria_id", $this->categoria_id);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Leer productos con categorías
    public function read($filtro_activos = null) {
        $query = "SELECT 
                    p.id,
                    p.nombre,
                    p.precio,
                    p.descripcion,
                    p.stock,
                    p.activo,
                    p.categoria_id,
                    p.created_at,
                    p.updated_at,
                    c.nombre as categoria_nombre,
                    c.color as categoria_color,
                    c.descripcion as categoria_descripcion
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categorias_productos c ON p.categoria_id = c.id";
        
        $conditions = array();
        $params = array();
        
        if ($filtro_activos === true) {
            $conditions[] = "p.activo = :activo_true";
            $params[':activo_true'] = 1;
        } elseif ($filtro_activos === false) {
            $conditions[] = "p.activo = :activo_false";
            $params[':activo_false'] = 0;
        }
        
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $query .= " ORDER BY p.nombre ASC";
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parámetros
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        return $stmt;
    }

    // Buscar producto por ID
    public function findById($id) {
        $query = "SELECT 
                    p.*,
                    c.nombre as categoria_nombre, 
                    c.color as categoria_color,
                    c.descripcion as categoria_descripcion
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categorias_productos c ON p.categoria_id = c.id 
                  WHERE p.id = :id LIMIT 1";
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
            $this->categoria_id = $row['categoria_id'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }

    // Actualizar producto
    public function update() {
        // Limpiar datos
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->precio = htmlspecialchars(strip_tags($this->precio));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->stock = htmlspecialchars(strip_tags($this->stock));
        $this->activo = $this->activo ? 1 : 0;
        $this->categoria_id = $this->categoria_id ? htmlspecialchars(strip_tags($this->categoria_id)) : null;
        $this->id = htmlspecialchars(strip_tags($this->id));

        if ($this->stock <= 0) {
            $this->activo = 0;
        }

        $query = "UPDATE " . $this->table_name . " 
                  SET nombre=:nombre, precio=:precio, descripcion=:descripcion, 
                      stock=:stock, activo=:activo, categoria_id=:categoria_id, updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        // Bind valores
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":categoria_id", $this->categoria_id);
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
        
        $result = $stmt->execute() && $stmt->rowCount() > 0;
        
        if ($result) {
            if ($this->findById($this->id)) {
                if ($this->stock <= 0) {
                    $query_desactivar = "UPDATE " . $this->table_name . " 
                                       SET activo = 0, updated_at=CURRENT_TIMESTAMP
                                       WHERE id = :id";
                    $stmt_desactivar = $this->conn->prepare($query_desactivar);
                    $stmt_desactivar->bindParam(":id", $this->id);
                    $stmt_desactivar->execute();
                }
            }
        }
        
        return $result;
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
