import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: MenuItem[];
  roles: string[];  // Roles que pueden ver este item
  badge?: string;   // Opcional: para mostrar notificaciones
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}