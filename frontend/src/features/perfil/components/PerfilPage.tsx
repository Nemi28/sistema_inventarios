import { useState } from 'react';
import { User, Mail, Shield, Calendar, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CambiarPasswordModal } from './CambiarPasswordModal';

export const PerfilPage = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
      {/* Encabezado del perfil */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {user?.nombre}
          </h2>
          <p className="text-gray-600">
            <span className="font-semibold capitalize">{user?.rol}</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {user?.activo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
            </span>
          </div>
        </div>
      </div>

      {/* Información del perfil */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Información del Perfil
          </h3>
          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Lock size={16} />
            Cambiar Contraseña
          </Button>
        </div>

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

          {/* Fecha de registro */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
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

      {/* Información adicional según rol */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Permisos y Accesos</h3>
        
        {user?.rol === 'administrador' && (
          <div className="text-gray-600">
            <p className="mb-2">
              Como <span className="font-semibold text-red-600">Administrador</span> tienes acceso completo al sistema.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li>Gestión de productos e inventario</li>
              <li>Administración de usuarios y roles</li>
              <li>Acceso a reportes y configuración</li>
              <li>Control total del sistema</li>
            </ul>
          </div>
        )}

        {user?.rol === 'gestor' && (
          <div className="text-gray-600">
            <p className="mb-2">
              Como <span className="font-semibold text-yellow-600">Gestor</span> puedes gestionar productos e inventario.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li>Gestión de productos e inventario</li>
              <li>Generar guías de remisión</li>
              <li>Acceso a reportes</li>
            </ul>
          </div>
        )}

        {user?.rol === 'operador' && (
          <div className="text-gray-600">
            <p className="mb-2">
              Como <span className="font-semibold text-green-600">Operador</span> puedes consultar productos e inventario.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li>Consulta de productos</li>
              <li>Visualización de inventario</li>
              <li>Acceso de solo lectura</li>
            </ul>
          </div>
        )}
      </div>

      {/* Modal de cambiar contraseña */}
      <CambiarPasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
    </div>
  );
};