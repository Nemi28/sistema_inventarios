import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="text-center animate-fadeIn">
        <h1 className="text-9xl font-extrabold text-white mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-300 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2"
        >
          <Home className="h-5 w-5" />
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;