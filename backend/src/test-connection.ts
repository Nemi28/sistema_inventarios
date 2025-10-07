import { connectDatabase, pool } from './config/database';

const testConnection = async () => {
  try {
    console.log('🔍 Probando conexión a MySQL...');
    
    // Probar conexión
    await connectDatabase();
    
    // Probar query simple
    const [rows]: any = await pool.query('SELECT * FROM roles');
    console.log('📋 Roles encontrados:', rows.length);
    console.table(rows);
    
    // Cerrar pool
    await pool.end();
    console.log('✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  }
};

testConnection();