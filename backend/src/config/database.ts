import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventarios',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crear pool de conexiones
export const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
export const connectDatabase = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a MySQL exitosamente');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
    process.exit(1);
  }
};

// Obtener una conexión del pool
export const getConnection = async () => {
  return await pool.getConnection();
};