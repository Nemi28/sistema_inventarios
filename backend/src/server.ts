import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import skuRoutes from './routes/sku.routes';
import socioRoutes from './routes/socio.routes';
import tiendaRoutes from './routes/tienda.routes';
import guiasRoutes from './routes/guias.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';

// Configurar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    mensaje: '🚀 API Sistema de Inventarios - Funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      skus: '/api/skus',
      socio: '/api/socios',
      tiendas: '/api/tiendas',
      docs: '/api/docs',
    },
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/socios', socioRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/guias', guiasRoutes);
// Middleware de rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Servidor Backend iniciado exitosamente      ║
║                                                   ║
║   📡 URL: http://localhost:${PORT}                  ║
║   🌍 Entorno: ${process.env.NODE_ENV || 'development'}              ║
║   📚 API Docs: http://localhost:${PORT}/api         ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();