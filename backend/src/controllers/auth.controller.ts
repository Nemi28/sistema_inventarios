import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { 
  crearUsuario, 
  obtenerUsuarioPorEmail, 
  obtenerUsuarioPorId 
} from '../models/user.model';
import { obtenerRolPorId } from '../models/role.model';
import { generateToken } from '../utils/jwt.utils';

export const registrar = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        success: false,
        mensaje: 'Errores de validación', 
        errores: errors.array() 
      });
      return;
    }

    const { nombre, email, password, rol_id } = req.body;

    // Verificar si el rol existe
    const rolExiste = await obtenerRolPorId(rol_id);
    if (!rolExiste) {
      res.status(400).json({ 
        success: false,
        mensaje: 'El rol especificado no existe' 
      });
      return;
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await obtenerUsuarioPorEmail(email);
    if (usuarioExiste) {
      res.status(400).json({ 
        success: false,
        mensaje: 'El email ya está registrado' 
      });
      return;
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuarioId = await crearUsuario({
      nombre,
      email,
      password: passwordHash,
      rol_id,
    });

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente',
      data: {
        id: nuevoUsuarioId,
        nombre,
        email,
        rol: rolExiste.nombre,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        success: false,
        mensaje: 'Errores de validación', 
        errores: errors.array() 
      });
      return;
    }

    const { email, password } = req.body;

    // Buscar usuario
    const usuario = await obtenerUsuarioPorEmail(email);
    if (!usuario) {
      res.status(404).json({ 
        success: false,
        mensaje: 'Credenciales inválidas' 
      });
      return;
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      res.status(403).json({ 
        success: false,
        mensaje: 'Usuario desactivado. Contacta al administrador.' 
      });
      return;
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      res.status(401).json({ 
        success: false,
        mensaje: 'Credenciales inválidas' 
      });
      return;
    }

    // Generar token
    const token = generateToken({
      id: usuario.id!,
      email: usuario.email,
      rol: usuario.rol_nombre!,
    });

    res.json({
      success: true,
      mensaje: 'Login exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol_nombre,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const perfil = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        mensaje: 'Usuario no autenticado' 
      });
      return;
    }

    const usuario = await obtenerUsuarioPorId(req.user.id);
    
    if (!usuario) {
      res.status(404).json({ 
        success: false,
        mensaje: 'Usuario no encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol_nombre,
        activo: usuario.activo,
        fecha_creacion: usuario.fecha_creacion,
      },
    });
  } catch (error) {
    next(error);
  }
};