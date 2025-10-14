import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

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
            {/* 🔹 Aquí se agregarán más rutas privadas en el futuro */}
            {/* Ejemplo:
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/agregar" element={<AgregarProducto />} />
            <Route path="/inventario/stock" element={<Stock />} />
            <Route path="/usuarios" element={<Usuarios />} />
            */}
          </Route>

          {/* Ruta raíz - redirige al dashboard si está autenticado */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Ruta 404 - Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Notificaciones Toast */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;