import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { menuItems, filterMenuByRole } from '../../config/menuItems';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed }) => {
  const { user } = useAuth();

  // Filtrar menú según el rol del usuario
  const filteredMenu = user ? filterMenuByRole(menuItems, user.rol) : [];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen bg-gray-900
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SI</span>
                </div>
                <span className="text-white font-semibold text-lg">Inventarios</span>
              </div>
            )}
            
            {/* Botón cerrar solo en mobile */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1">
              {filteredMenu.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </nav>

          {/* Footer del Sidebar */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-800">
              <div className="text-xs text-gray-500 text-center">
                <p>Sistema de Inventarios</p>
                <p className="mt-1">v1.0.0</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;