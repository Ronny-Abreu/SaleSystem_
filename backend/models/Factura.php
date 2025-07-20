<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validator.php';

class Factura {
    private $conn;
    private $table_name = "facturas";
    private $detalles_table = "factura_detalles";

    public $id;
    public $numero_factura;
    public $cliente_id;
    public $fecha;
    public $subtotal;
    public $total;
    public $comentario;
    public $estado;
    public $created_at;
    public $updated_at;
    
    // Para incluir datos relacionados
    public $cliente;
    public $detalles;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Generar número único de factura automático
    public function generateNumeroFactura() {
        $query = "SELECT numero_factura FROM " . $this->table_name . " 
                  WHERE numero_factura LIKE 'REC-%' 
                  ORDER BY id DESC LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            // Extraer el número y incrementar
            $ultimo_numero = intval(str_replace('REC-', '', $result['numero_factura']));
            $nuevo_numero = $ultimo_numero + 1;
        } else {
            $nuevo_numero = 1;
        }
        
        return 'REC-' . str_pad($nuevo_numero, 3, '0', STR_PAD_LEFT);
    }

    // Crear factura con detalles (transacción), TODO - Add funcionalidad (Ver si calcularle el ITBIS, delivery, monto total con articulos + generar codigo QR para que tenga la factura disponible en cualquier momento.)
    public function create($detalles_data) {
        try {
            // Iniciar transacción
            $this->conn->beginTransaction();
            
            // Generar número de factura si no existe
            if (empty($this->numero_factura)) {
                $this->numero_factura = $this->generateNumeroFactura();
            }
            
            // Crear la factura
            $query = "INSERT INTO " . $this->table_name . " 
                      SET numero_factura=:numero_factura, cliente_id=:cliente_id, 
                          fecha=:fecha, subtotal=:subtotal, total=:total, 
                          comentario=:comentario, estado=:estado";

            $stmt = $this->conn->prepare($query);

            // Limpiar datos
            $this->numero_factura = htmlspecialchars(strip_tags($this->numero_factura));
            $this->cliente_id = htmlspecialchars(strip_tags($this->cliente_id));
            $this->fecha = htmlspecialchars(strip_tags($this->fecha));
            $this->subtotal = htmlspecialchars(strip_tags($this->subtotal));
            $this->total = htmlspecialchars(strip_tags($this->total));
            $this->comentario = htmlspecialchars(strip_tags($this->comentario));
            $this->estado = htmlspecialchars(strip_tags($this->estado));

            // Bind valores
            $stmt->bindParam(":numero_factura", $this->numero_factura);
            $stmt->bindParam(":cliente_id", $this->cliente_id);
            $stmt->bindParam(":fecha", $this->fecha);
            $stmt->bindParam(":subtotal", $this->subtotal);
            $stmt->bindParam(":total", $this->total);
            $stmt->bindParam(":comentario", $this->comentario);
            $stmt->bindParam(":estado", $this->estado);

            if (!$stmt->execute()) {
                throw new Exception("Error al crear la factura");
            }

            $this->id = $this->conn->lastInsertId();

            // Crear los detalles de la factura
            $this->createDetalles($detalles_data);
            
            // Confirmar transacción
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $this->conn->rollback();
            throw $e;
        }
    }

    // Crear detalles de factura
    private function createDetalles($detalles_data) {
        require_once __DIR__ . '/Producto.php';
        
        foreach ($detalles_data as $detalle) {
            // Validar que el producto existe y tiene stock suficiente para no crear facturas sin tener el articulo disponible.
            $producto = new Producto($this->conn);
            if (!$producto->findById($detalle['producto_id'])) {
                throw new Exception("Producto con ID {$detalle['producto_id']} no encontrado");
            }
            
            if ($producto->stock < $detalle['cantidad']) {
                throw new Exception("Stock insuficiente para el producto: {$producto->nombre}");
            }
            
            // Crear el detalle
            $query = "INSERT INTO " . $this->detalles_table . " 
                      SET factura_id=:factura_id, producto_id=:producto_id, 
                          nombre_producto=:nombre_producto, cantidad=:cantidad, 
                          precio_unitario=:precio_unitario, total_linea=:total_linea";

            $stmt = $this->conn->prepare($query);
            
            $total_linea = $detalle['cantidad'] * $detalle['precio_unitario'];
            
            $stmt->bindParam(":factura_id", $this->id);
            $stmt->bindParam(":producto_id", $detalle['producto_id']);
            $stmt->bindParam(":nombre_producto", $producto->nombre);
            $stmt->bindParam(":cantidad", $detalle['cantidad']);
            $stmt->bindParam(":precio_unitario", $detalle['precio_unitario']);
            $stmt->bindParam(":total_linea", $total_linea);
            
            if (!$stmt->execute()) {
                throw new Exception("Error al crear detalle de factura");
            }
            
            // Actualizar stock del producto
            if (!$producto->updateStock($detalle['cantidad'])) {
                throw new Exception("Error al actualizar stock del producto: {$producto->nombre}");
            }
        }
    }

    // Leer todas las facturas
    public function read($fecha_desde = null, $fecha_hasta = null, $estado = null) {
        $query = "SELECT f.*, c.codigo as cliente_codigo, c.nombre as cliente_nombre 
                  FROM " . $this->table_name . " f 
                  LEFT JOIN clientes c ON f.cliente_id = c.id 
                  WHERE 1=1";
        
        $params = array();
        
        if ($fecha_desde) {
            $query .= " AND f.fecha >= :fecha_desde";
            $params[':fecha_desde'] = $fecha_desde;
        }
        
        if ($fecha_hasta) {
            $query .= " AND f.fecha <= :fecha_hasta";
            $params[':fecha_hasta'] = $fecha_hasta;
        }
        
        if ($estado) {
            $query .= " AND f.estado = :estado";
            $params[':estado'] = $estado;
        }
        
        $query .= " ORDER BY f.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        return $stmt;
    }

    // Buscar factura por ID con detalles
    public function findById($id) {
        // Obtener la factura
        $query = "SELECT f.*, c.codigo as cliente_codigo, c.nombre as cliente_nombre,
                         c.telefono as cliente_telefono, c.email as cliente_email
                  FROM " . $this->table_name . " f 
                  LEFT JOIN clientes c ON f.cliente_id = c.id 
                  WHERE f.id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->id = $row['id'];
            $this->numero_factura = $row['numero_factura'];
            $this->cliente_id = $row['cliente_id'];
            $this->fecha = $row['fecha'];
            $this->subtotal = $row['subtotal'];
            $this->total = $row['total'];
            $this->comentario = $row['comentario'];
            $this->estado = $row['estado'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            // Datos del cliente
            $this->cliente = array(
                'id' => $row['cliente_id'],
                'codigo' => $row['cliente_codigo'],
                'nombre' => $row['cliente_nombre'],
                'telefono' => $row['cliente_telefono'],
                'email' => $row['cliente_email']
            );
            
            // Obtener detalles
            $this->detalles = $this->getDetalles($id);
            
            return true;
        }
        
        return false;
    }

    // Obtener detalles de una factura
    private function getDetalles($factura_id) {
        $query = "SELECT fd.*, p.descripcion as producto_descripcion
                  FROM " . $this->detalles_table . " fd
                  LEFT JOIN productos p ON fd.producto_id = p.id
                  WHERE fd.factura_id = :factura_id
                  ORDER BY fd.id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":factura_id", $factura_id);
        $stmt->execute();
        
        $detalles = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $detalles[] = array(
                'id' => $row['id'],
                'producto_id' => $row['producto_id'],
                'nombre_producto' => $row['nombre_producto'],
                'cantidad' => intval($row['cantidad']),
                'precio_unitario' => floatval($row['precio_unitario']),
                'total_linea' => floatval($row['total_linea']),
                'producto_descripcion' => $row['producto_descripcion']
            );
        }
        
        return $detalles;
    }

    // Buscar factura por su número único
    public function findByNumero($numero_factura) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE numero_factura = :numero_factura LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":numero_factura", $numero_factura);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            return $this->findById($row['id']);
        }
        
        return false;
    }

    // Actualizar estado de factura
    public function updateEstado($nuevo_estado) {
        $query = "UPDATE " . $this->table_name . " 
                  SET estado=:estado, updated_at=CURRENT_TIMESTAMP
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":estado", $nuevo_estado);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Obtener estadísticas del día de hoy (current)
    public function getEstadisticasDelDia($fecha = null) {
        if (!$fecha) {
            $fecha = date('Y-m-d');
        }
        
        // Se buscará solo las que han sido pagadas para cargar el total a los ingresos de hoy. 
        $query = "SELECT 
                    COUNT(*) as total_facturas,
                    COALESCE(SUM(total), 0) as total_ingresos,
                    COALESCE(AVG(total), 0) as promedio_factura
                  FROM " . $this->table_name . " 
                  WHERE DATE(fecha) = :fecha AND estado = 'pagada'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":fecha", $fecha);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Validar datos de la factura
    public function validate($detalles_data) {
        try {
            Validator::required($this->cliente_id, 'cliente_id');
            Validator::required($this->fecha, 'fecha');
            Validator::numeric($this->cliente_id, 'cliente_id');
            Validator::numeric($this->subtotal, 'subtotal');
            Validator::numeric($this->total, 'total');
            
            if (empty($detalles_data) || !is_array($detalles_data)) {
                throw new Exception("La factura debe tener al menos un artículo");
            }
            
            // Validar cada detalle con especifidad para que no falte ningún detalle en la factura.
            foreach ($detalles_data as $detalle) {
                if (empty($detalle['producto_id']) || empty($detalle['cantidad']) || empty($detalle['precio_unitario'])) {
                    throw new Exception("Todos los artículos deben tener producto, cantidad y precio");
                }
                
                if ($detalle['cantidad'] <= 0) {
                    throw new Exception("La cantidad debe ser mayor a 0");
                }
                
                if ($detalle['precio_unitario'] <= 0) {
                    throw new Exception("El precio unitario debe ser mayor a 0");
                }
            }
            
            return true;
        } catch (Exception $e) {
            throw $e;
        }
    }
}
?>
