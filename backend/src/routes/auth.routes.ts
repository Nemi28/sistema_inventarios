import express from 'express';
import { registrar, login, perfil } from '../controllers/auth.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { registroValidation, loginValidation } from '../middlewares/validators';

const router = express.Router();

// Rutas públicas
router.post('/register', registroValidation, registrar);
router.post('/login', loginValidation, login);

// Rutas protegidas
router.get('/perfil', verificarToken, perfil);

// Ejemplo de ruta protegida solo para administradores
router.get(
  '/admin-only', 
  verificarToken, 
  verificarRol('administrador'), 
  (req, res) => {
    res.json({ 
      success: true,
      mensaje: '¡Bienvenido Administrador!' 
    });
  }
);

export default router;