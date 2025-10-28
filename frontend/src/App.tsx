import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

import { SKUsPage } from './features/skus/components/SKUsPage';
import { SociosPage } from './features/socios/components/SociosPage';
import { TiendasPage } from './features/tiendas/components/TiendasPage';
import { GuiasPage } from './features/guias/components/GuiasPage';
import { CategoriasPage } from './features/categorias/components/CategoriasPage';
import { EquiposPage } from './features/equipos/components/EquiposPage';
import { OrdenesCompraPage } from './features/ordenes_compra/components/OrdenesCompraPage';




function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas - solo accesibles si NO estás autenticado */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Rutas privadas con MainLayout - Rutas anidadas */}
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/skus" element={<SKUsPage />} />
            <Route path="/socios" element={<SociosPage />} />
            <Route path="/tiendas" element={<TiendasPage />} />
            <Route path="/guias" element={<GuiasPage />} />
            <Route path="/categorias" element={<CategoriasPage />} />
            <Route path="/equipos" element={<EquiposPage />} />
            <Route path="/ordenes-compra" element={<OrdenesCompraPage />} />
          </Route>

          {/* Ruta raíz - redirige al dashboard si está autenticado */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Ruta 404 - Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;