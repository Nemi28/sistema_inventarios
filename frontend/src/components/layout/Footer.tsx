import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-sm">
            <p>&copy; {currentYear} Sistema de Inventarios. Todos los derechos reservados.</p>
          </div>

          {/* Version */}
          <div className="text-sm">
            <span className="text-gray-500">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;