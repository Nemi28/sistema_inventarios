import React, { useState } from 'react';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'gestor':
        return 'bg-yellow-100 text-yellow-800';
      case 'operador':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section: Toggle button + Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo and title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SIGA</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                GESTIÓN DE ACTIVOS
              </h1>
            </div>
          </div>

          {/* Right section: User menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user ? getInitials(user.nombre) : 'U'}
                </span>
              </div>

              {/* User info - Hidden on mobile */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">
                  {user?.nombre || 'Usuario'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.rol || '')}`}>
                  {user?.rol || 'Sin rol'}
                </span>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-600 hidden md:block transition-transform ${
                  showDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <>
                {/* Overlay to close dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />

                {/* Dropdown content */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {/* User info in dropdown - Visible on mobile */}
                  <div className="px-4 py-3 border-b border-gray-200 md:hidden">
                    <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 ${getRoleBadgeColor(user?.rol || '')}`}>
                      {user?.rol}
                    </span>
                  </div>

                  {/* Desktop user info */}
                  <div className="hidden md:block px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  {/* Menu items */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/perfil');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={16} />
                    <span>Ver Perfil</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;