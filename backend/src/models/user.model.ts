import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  password: string;
  rol_id: number;
  activo?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export interface UsuarioConRol extends Usuario {
  rol_nombre?: string;
}

export const crearUsuario = async (usuario: Usuario): Promise<number> => {
  try {
    const { nombre, email, password, rol_id } = usuario;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, password, rol_id]
    );
    return result.insertId;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El email ya está registrado');
    }
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
};

export const obtenerUsuarioPorEmail = async (email: string): Promise<UsuarioConRol | null> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.*, r.nombre as rol_nombre 
       FROM usuarios u 
       INNER JOIN roles r ON u.rol_id = r.id 
       WHERE u.email = ?`,
      [email]
    );
    return rows.length > 0 ? (rows[0] as UsuarioConRol) : null;
  } catch (error) {
    throw new Error(`Error al obtener usuario: ${error}`);
  }
};

export const obtenerUsuarioPorId = async (id: number): Promise<UsuarioConRol | null> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.*, r.nombre as rol_nombre 
       FROM usuarios u 
       INNER JOIN roles r ON u.rol_id = r.id 
       WHERE u.id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as UsuarioConRol) : null;
  } catch (error) {
    throw new Error(`Error al obtener usuario por ID: ${error}`);
  }
};

export const actualizarUsuario = async (id: number, datos: Partial<Usuario>): Promise<boolean> => {
  try {
    const campos = Object.keys(datos).map(key => `${key} = ?`).join(', ');
    const valores = [...Object.values(datos), id];
    
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE usuarios SET ${campos} WHERE id = ?`,
      valores
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al actualizar usuario: ${error}`);
  }
};

export const listarUsuarios = async (): Promise<UsuarioConRol[]> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.nombre, u.email, u.rol_id, u.activo, 
              u.fecha_creacion, u.fecha_actualizacion, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       ORDER BY u.fecha_creacion DESC`
    );
    return rows as UsuarioConRol[];
  } catch (error) {
    throw new Error(`Error al listar usuarios: ${error}`);
  }
};