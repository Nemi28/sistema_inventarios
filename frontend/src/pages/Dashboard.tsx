import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Sistema de Inventarios
              </h1>
              <p className="text-gray-400 text-sm mt-1">Panel de Control</p>
            </div>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mensaje de bienvenida */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 animate-fadeIn">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Bienvenido, {user?.nombre}!
            </h2>
            <p className="text-gray-600">
              Has iniciado sesión exitosamente en el sistema
            </p>
          </div>
        </div>

        {/* Información del perfil */}
        <div className="bg-white rounded-xl shadow-xl p-8 animate-fadeIn">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Información del Perfil
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">ID</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">ID de Usuario</p>
                <p className="text-lg font-semibold text-gray-800">{user?.id}</p>
              </div>
            </div>

            {/* Nombre */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-800">{user?.nombre}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Correo Electrónico</p>
                <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
              </div>
            </div>

            {/* Rol */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {user?.rol}
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-lg font-semibold text-green-600">
                  {user?.activo ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>

            {/* Fecha de registro */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Registro</p>
                <p className="text-lg font-semibold text-gray-800">
                {formatDate(user?.fecha_creacion)}
                 
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">ℹ</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                ¡Sistema en Construcción!
              </h4>
              <p className="text-gray-600">
                Este es el dashboard básico de autenticación. Las funcionalidades de gestión
                de inventario se implementarán en las siguientes fases del proyecto.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            © 2025 Sistema de Inventarios. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;