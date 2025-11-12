import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import { EmailService } from '../services/email.service';

export class PasswordController {
  /**
   * Cambiar contraseña (usuario autenticado)
   * PUT /api/password/cambiar
   */
  static async cambiarPassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id; // Del token JWT
      const { password_actual, password_nueva } = req.body;

      // Validar que vengan los datos
      if (!password_actual || !password_nueva) {
        res.status(400).json({
          success: false,
          mensaje: 'Debes proporcionar la contraseña actual y la nueva',
        });
        return;
      }

      // Validar longitud de nueva contraseña
      if (password_nueva.length < 6) {
        res.status(400).json({
          success: false,
          mensaje: 'La nueva contraseña debe tener al menos 6 caracteres',
        });
        return;
      }

      // Obtener usuario actual
      const [usuarios] = await pool.query<RowDataPacket[]>(
        'SELECT id, password FROM usuarios WHERE id = ?',
        [userId]
      );

      if (usuarios.length === 0) {
        res.status(404).json({
          success: false,
          mensaje: 'Usuario no encontrado',
        });
        return;
      }

      const usuario = usuarios[0];

      // Verificar contraseña actual
      const passwordValida = await bcrypt.compare(
        password_actual,
        usuario.password
      );

      if (!passwordValida) {
        res.status(401).json({
          success: false,
          mensaje: 'La contraseña actual es incorrecta',
        });
        return;
      }

      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password_nueva, salt);

      // Actualizar contraseña
      await pool.query(
        'UPDATE usuarios SET password = ? WHERE id = ?',
        [passwordHash, userId]
      );

      res.json({
        success: true,
        mensaje: 'Contraseña actualizada correctamente',
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error al cambiar la contraseña',
      });
    }
  }

  /**
   * Solicitar recuperación de contraseña
   * POST /api/password/solicitar-recuperacion
   */
  static async solicitarRecuperacion(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          mensaje: 'El email es requerido',
        });
        return;
      }

      // Verificar que el usuario exista
      const [usuarios] = await pool.query<RowDataPacket[]>(
        'SELECT id, nombre, email FROM usuarios WHERE email = ? AND activo = 1',
        [email]
      );

      // Por seguridad, siempre respondemos success incluso si el email no existe
      if (usuarios.length === 0) {
        res.json({
          success: true,
          mensaje: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
        });
        return;
      }

      const usuario = usuarios[0];

      // Generar token único
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');

      // El token expira en 1 hora
      const expiraEn = new Date();
      expiraEn.setHours(expiraEn.getHours() + 1);

      // Guardar token en la BD
      await pool.query(
        `INSERT INTO password_reset_tokens (usuario_id, token, expira_en) 
         VALUES (?, ?, ?)`,
        [usuario.id, token, expiraEn]
      );

      // Enviar email con el link de recuperación
      const emailEnviado = await EmailService.enviarEmailRecuperacion(
        usuario.email,
        usuario.nombre,
        token
      );

      if (!emailEnviado && process.env.NODE_ENV === 'development') {
        console.error('No se pudo enviar el email de recuperación');
      }

      // En desarrollo, también mostrar el link en consola
      if (process.env.NODE_ENV === 'development') {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        console.log('=== LINK DE RECUPERACIÓN ===');
        console.log('Usuario:', usuario.email);
        console.log('Link:', resetLink);
        console.log('===========================');
      }

      res.json({
        success: true,
        mensaje: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
        // Solo en desarrollo:
        ...(process.env.NODE_ENV === 'development' && {
          dev_reset_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`,
          dev_token: token,
        }),
      });
    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error al procesar la solicitud',
      });
    }
  }

  /**
   * Validar token de recuperación
   * GET /api/password/validar-token/:token
   */
  static async validarToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const [tokens] = await pool.query<RowDataPacket[]>(
        `SELECT t.id, t.usuario_id, t.expira_en, t.usado, u.email
         FROM password_reset_tokens t
         INNER JOIN usuarios u ON t.usuario_id = u.id
         WHERE t.token = ? AND t.usado = 0`,
        [token]
      );

      if (tokens.length === 0) {
        res.status(400).json({
          success: false,
          mensaje: 'Token inválido o ya utilizado',
        });
        return;
      }

      const tokenData = tokens[0];
      const ahora = new Date();
      const expira = new Date(tokenData.expira_en);

      if (ahora > expira) {
        res.status(400).json({
          success: false,
          mensaje: 'El token ha expirado',
        });
        return;
      }

      res.json({
        success: true,
        mensaje: 'Token válido',
        data: {
          email: tokenData.email,
        },
      });
    } catch (error) {
      console.error('Error al validar token:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error al validar el token',
      });
    }
  }

  /**
   * Resetear contraseña con token
   * POST /api/password/resetear
   */
  static async resetearPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password_nueva } = req.body;

      if (!token || !password_nueva) {
        res.status(400).json({
          success: false,
          mensaje: 'Token y nueva contraseña son requeridos',
        });
        return;
      }

      if (password_nueva.length < 6) {
        res.status(400).json({
          success: false,
          mensaje: 'La contraseña debe tener al menos 6 caracteres',
        });
        return;
      }

      // Verificar token
      const [tokens] = await pool.query<RowDataPacket[]>(
        `SELECT id, usuario_id, expira_en, usado
         FROM password_reset_tokens
         WHERE token = ? AND usado = 0`,
        [token]
      );

      if (tokens.length === 0) {
        res.status(400).json({
          success: false,
          mensaje: 'Token inválido o ya utilizado',
        });
        return;
      }

      const tokenData = tokens[0];
      const ahora = new Date();
      const expira = new Date(tokenData.expira_en);

      if (ahora > expira) {
        res.status(400).json({
          success: false,
          mensaje: 'El token ha expirado',
        });
        return;
      }

      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password_nueva, salt);

      // Actualizar contraseña del usuario
      await pool.query(
        'UPDATE usuarios SET password = ? WHERE id = ?',
        [passwordHash, tokenData.usuario_id]
      );

      // Marcar token como usado
      await pool.query(
        'UPDATE password_reset_tokens SET usado = 1 WHERE id = ?',
        [tokenData.id]
      );

      res.json({
        success: true,
        mensaje: 'Contraseña restablecida correctamente',
      });
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error al restablecer la contraseña',
      });
    }
  }
}