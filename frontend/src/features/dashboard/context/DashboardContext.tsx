import { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardFiltros } from '../types';

interface DashboardContextType {
  filtros: DashboardFiltros;
  setFiltros: (filtros: DashboardFiltros) => void;
  setSocioId: (id: number | undefined) => void;
  setSubcategoriaId: (id: number | undefined) => void;
  limpiarFiltros: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [filtros, setFiltros] = useState<DashboardFiltros>({});

  const setSocioId = (id: number | undefined) => {
    setFiltros((prev) => ({ ...prev, socio_id: id }));
  };

  const setSubcategoriaId = (id: number | undefined) => {
    setFiltros((prev) => ({ ...prev, subcategoria_id: id }));
  };

  const limpiarFiltros = () => {
    setFiltros({});
  };

  return (
    <DashboardContext.Provider
      value={{ filtros, setFiltros, setSocioId, setSubcategoriaId, limpiarFiltros }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardFiltros = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardFiltros debe usarse dentro de DashboardProvider');
  }
  return context;
};