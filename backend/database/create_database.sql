-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS salesystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE salesystem;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    rol ENUM('admin', 'vendedor') DEFAULT 'vendedor',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_nombre (nombre)
);

-- Tabla de productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    stock INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
);

-- Tabla de facturas
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    fecha DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    comentario TEXT,
    estado ENUM('pagada', 'pendiente', 'anulada') DEFAULT 'pagada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    INDEX idx_numero_factura (numero_factura),
    INDEX idx_fecha (fecha),
    INDEX idx_cliente (cliente_id),
    INDEX idx_estado (estado)
);

-- Tabla de detalles de factura
CREATE TABLE factura_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    producto_id INT NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    total_linea DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_factura (factura_id),
    INDEX idx_producto (producto_id)
);

-- DATOS SEMILLA:
-- Insertar usuario administrador por defecto
INSERT INTO usuarios (username, password, nombre, email, rol) VALUES 
('admin', 'SaleSystem', 'Administrador', 'admin@larubia.com', 'admin');

-- Insertar algunos clientes de ejemplo
INSERT INTO clientes (codigo, nombre, telefono, email) VALUES 
('CLI-001', 'Juan Pérez', '809-555-0001', 'juan@email.com'),
('CLI-002', 'María García', '809-555-0002', 'maria@email.com'),
('CLI-003', 'Carlos López', '809-555-0003', 'carlos@email.com');

-- Insertar algunos productos de ejemplo
INSERT INTO productos (nombre, precio, descripcion, stock) VALUES 
('Refresco Coca Cola', 50.00, 'Refresco de cola 355ml', 100),
('Agua Mineral', 25.00, 'Agua mineral 500ml', 150),
('Sandwich Mixto', 150.00, 'Sandwich de jamón y queso', 50),
('Café Americano', 75.00, 'Café americano caliente', 80);