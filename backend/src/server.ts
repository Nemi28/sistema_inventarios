import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, pool } from './config/database';
import authRoutes from './routes/auth.routes';
import skuRoutes from './routes/sku.routes';
import socioRoutes from './routes/socio.routes';
import tiendaRoutes from './routes/tienda.routes';
import guiaRoutes from './routes/guias.routes';
import categoriaRoutes from './routes/categoria.routes';
import equiposRoutes from './routes/equipos.routes';
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
      socios: '/api/socios',
      tiendas: '/api/tiendas',
      categorias: '/api/categorias',
      equipos: '/api/equipos',
      guias: '/api/guias',
      health: '/health',
      docs: '/api/docs',
    },
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/socios', socioRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/guias', guiaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/equipos', equiposRoutes);

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
║   💚 Health: http://localhost:${PORT}/health        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Función para cerrar gracefully
async function shutdownGracefully(signal: string) {
  console.log(`\n⚠️  ${signal} recibido. Cerrando servidor gracefully...`);
  try {
    await pool.end();
    console.log('✅ Conexión a BD cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error);
    process.exit(1);
  }
}

// Escuchar señales de terminación
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));

startServer();