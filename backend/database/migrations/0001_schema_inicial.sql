-- ============================================
-- MIGRACIÓN #001: SCHEMA INICIAL
-- Fecha: 2025-10-23
-- Descripción: Tablas base del sistema
-- ============================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_email (email),
  INDEX idx_rol (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles base
INSERT INTO roles (nombre, descripcion) VALUES 
  ('administrador', 'Acceso total al sistema'),
  ('gestor', 'Gestión de inventario y productos'),
  ('operador', 'Solo lectura y operaciones básicas')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Tabla de SKUs
CREATE TABLE IF NOT EXISTS skus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_sku VARCHAR(20) NOT NULL UNIQUE,
  descripcion_sku VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_codigo_sku (codigo_sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Socios
CREATE TABLE IF NOT EXISTS socio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(50) NOT NULL UNIQUE,
  ruc VARCHAR(20) NOT NULL UNIQUE,
  direccion VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_razon_social (razon_social),
  INDEX idx_ruc (ruc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tiendas
CREATE TABLE IF NOT EXISTS tienda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pdv VARCHAR(10) NOT NULL UNIQUE,
  tipo_local VARCHAR(10) NOT NULL,
  perfil_local VARCHAR(10) NOT NULL,
  nombre_tienda VARCHAR(50) NOT NULL UNIQUE,
  socio_id INT NOT NULL,
  direccion VARCHAR(100) NOT NULL,
  ubigeo VARCHAR(8) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (socio_id) REFERENCES socio(id) ON DELETE RESTRICT,
  INDEX idx_nombre_tienda (nombre_tienda),
  INDEX idx_socio_pdv (socio_id, pdv)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FIN MIGRACIÓN #001
-- ============================================