import { Router } from 'express';
import { PasswordController } from '../controllers/password.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Cambiar contraseña (requiere autenticación)
router.put('/cambiar', verificarToken, PasswordController.cambiarPassword);

// Recuperar contraseña (NO requiere autenticación)
router.post('/solicitar-recuperacion', PasswordController.solicitarRecuperacion);
router.get('/validar-token/:token', PasswordController.validarToken);
router.post('/resetear', PasswordController.resetearPassword);

export default router;