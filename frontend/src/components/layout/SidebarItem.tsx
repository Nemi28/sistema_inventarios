import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuItem } from '../../types/menu.types';

interface SidebarItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  depth?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isCollapsed, depth = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === location.pathname;
  
  // Check if any child is active
  const hasActiveChild = item.children?.some(child => child.path === location.pathname);

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const Icon = item.icon;

  return (
    <div>
      {/* Main item */}
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-sm font-medium
          transition-all duration-200 group
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : hasActiveChild
            ? 'bg-gray-800 text-blue-400'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }
          ${depth > 0 ? 'pl-12' : ''}
        `}
        title={isCollapsed ? item.label : ''}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Icon 
            size={20} 
            className={`flex-shrink-0 ${isActive ? 'text-white' : ''}`}
          />
          {!isCollapsed && (
            <span className="truncate">{item.label}</span>
          )}
        </div>

        {/* Expand/Collapse icon for items with children */}
        {!isCollapsed && hasChildren && (
          <span className="ml-2 flex-shrink-0">
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </span>
        )}

        {/* Badge (optional) */}
        {!isCollapsed && item.badge && (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
            {item.badge}
          </span>
        )}
      </button>

      {/* Children items (submenu) */}
      {!isCollapsed && hasChildren && isExpanded && (
        <div className="bg-gray-900">
          {item.children?.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              isCollapsed={isCollapsed}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;