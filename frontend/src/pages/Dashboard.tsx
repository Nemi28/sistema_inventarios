import React from 'react';
import { User, Mail, Shield, Calendar, Package, BarChart3, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isGestor } = usePermissions();

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
    <div className="space-y-6">
      {/* Mensaje de bienvenida */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Bienvenido, {user?.nombre}!
          </h2>
          <p className="text-gray-600">
            Has iniciado sesión como <span className="font-semibold capitalize">{user?.rol}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards - Solo para Admin y Gestor */}
      {(isAdmin || isGestor) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">150</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">3,450</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">25</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del perfil */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          Información del Perfil
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 bg-opacity-10 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">ID</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID de Usuario</p>
              <p className="text-lg font-semibold text-gray-800">{user?.id}</p>
            </div>
          </div>

          {/* Nombre */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-green-500" />
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

      {/* Panel de control según rol */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Panel de Control</h3>
        
        {isAdmin && (
          <div className="text-gray-600">
            <p className="mb-2">
              Como <span className="font-semibold text-red-600">Administrador</span> tienes acceso completo al sistema.
            </p>
            <p>Puedes gestionar productos, inventario, usuarios, reportes y configuración desde el menú lateral.</p>
          </div>
        )}

        {isGestor && (
          <div className="text-gray-600">
            <p className="mb-2">
              Como <span className="font-semibold text-yellow-600">Gestor</span> puedes gestionar productos e inventario.
            </p>
            <p>Accede al menú lateral para explorar las opciones de gestión disponibles.</p>
          </div>
        )}

        {!isAdmin && !isGestor && (
          <div className="text-gray-600">
            <p className="mb-2">
              Como <span className="font-semibold text-green-600">Operador</span> puedes consultar productos e inventario.
            </p>
            <p>Tienes acceso de solo lectura a la información del sistema.</p>
          </div>
        )}
      </div>

      {/* Mensaje informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">ℹ</span>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Sistema de Navegación Implementado
            </h4>
            <p className="text-gray-600">
              El menú lateral muestra las opciones según tu rol. Las funcionalidades de gestión
              de inventario se implementarán en las siguientes fases del proyecto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;