import {
  Home,
  Package,
  BarChart3,
  Users,
  FileText,
  Settings,
  ShoppingCart,
  AlertCircle,
  FolderOpen,
  Plus,
  List,
  Tag
} from 'lucide-react';
import { MenuItem } from '../types/menu.types';

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['administrador', 'gestor', 'operador']
  },
    {
    id: 'skus',
    label: 'SKUs',
    icon: Tag,
    path: '/skus',
    roles: ['administrador', 'gestor', 'operador']
  },
      {
    id: 'socios',
    label: 'SOCIOS',
    icon: Users,
    path: '/socios',
    roles: ['administrador', 'gestor', 'operador']
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: Package,
    roles: ['administrador', 'gestor', 'operador'],
    children: [
      {
        id: 'productos-ver',
        label: 'Ver Productos',
        icon: List,
        path: '/productos',
        roles: ['administrador', 'gestor', 'operador']
      },
      {
        id: 'productos-agregar',
        label: 'Agregar Producto',
        icon: Plus,
        path: '/productos/agregar',
        roles: ['administrador', 'gestor']
      },
      {
        id: 'productos-categorias',
        label: 'Categorías',
        icon: FolderOpen,
        path: '/productos/categorias',
        roles: ['administrador', 'gestor']
      }
    ]
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: BarChart3,
    roles: ['administrador', 'gestor', 'operador'],
    children: [
      {
        id: 'inventario-stock',
        label: 'Control de Stock',
        icon: ShoppingCart,
        path: '/inventario/stock',
        roles: ['administrador', 'gestor', 'operador']
      },
      {
        id: 'inventario-movimientos',
        label: 'Movimientos',
        icon: List,
        path: '/inventario/movimientos',
        roles: ['administrador', 'gestor']
      },
      {
        id: 'inventario-alertas',
        label: 'Alertas',
        icon: AlertCircle,
        path: '/inventario/alertas',
        roles: ['administrador', 'gestor']
      }
    ]
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: Users,
    roles: ['administrador'],
    children: [
      {
        id: 'usuarios-ver',
        label: 'Ver Usuarios',
        icon: List,
        path: '/usuarios',
        roles: ['administrador']
      },
      {
        id: 'usuarios-agregar',
        label: 'Agregar Usuario',
        icon: Plus,
        path: '/usuarios/agregar',
        roles: ['administrador']
      },
      {
        id: 'usuarios-roles',
        label: 'Roles y Permisos',
        icon: Settings,
        path: '/usuarios/roles',
        roles: ['administrador']
      }
    ]
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: FileText,
    path: '/reportes',
    roles: ['administrador', 'gestor']
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    path: '/configuracion',
    roles: ['administrador']
  }
];

// Función helper para filtrar items por rol
export const filterMenuByRole = (items: MenuItem[], userRole: string): MenuItem[] => {
  return items
    .filter(item => item.roles.includes(userRole))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterMenuByRole(item.children, userRole)
        };
      }
      return item;
    });
};