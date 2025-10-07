import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_creacion: Date;
}

export const obtenerRolPorId = async (id: number): Promise<Role | null> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM roles WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as Role) : null;
  } catch (error) {
    throw new Error(`Error al obtener rol: ${error}`);
  }
};

export const obtenerRolPorNombre = async (nombre: string): Promise<Role | null> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM roles WHERE nombre = ?',
      [nombre]
    );
    return rows.length > 0 ? (rows[0] as Role) : null;
  } catch (error) {
    throw new Error(`Error al obtener rol por nombre: ${error}`);
  }
};

export const listarRoles = async (): Promise<Role[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM roles ORDER BY nombre'
    );
    return rows as Role[];
  } catch (error) {
    throw new Error(`Error al listar roles: ${error}`);
  }
};