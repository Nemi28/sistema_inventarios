import React, { useState } from 'react';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import ActaFormModal from './ActaFormModal';

export const ActasPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Actas de Entrega de Equipos
            </h1>
            <p className="text-sm text-gray-600">
              Genera actas en formato PDF para la entrega de equipos
            </p>
          </div>
        </div>
      </div>

      {/* Botón generar */}
      <div className="mb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nueva Acta
        </button>
      </div>

      {/* Instrucciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Instrucciones
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Sigue estos pasos para generar un acta de entrega de equipos:
            </p>
          </div>
        </div>

        <div className="space-y-4 ml-8">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </span>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Selecciona el tipo de atención
              </h3>
              <p className="text-sm text-gray-600">
                Elige entre: Préstamo, Reemplazo, Asignación o Upgrade
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </span>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Completa la información del usuario
              </h3>
              <p className="text-sm text-gray-600">
                Ingresa datos como nombre, email, cargo, área, local, fechas, etc.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </span>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Agrega los equipos entregados
              </h3>
              <p className="text-sm text-gray-600">
                Añade uno o más equipos con su información (marca, modelo, serie, etc.)
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              4
            </span>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Agrega equipos a recoger (opcional)
              </h3>
              <p className="text-sm text-gray-600">
                Solo si el tipo es "Reemplazo" o "Upgrade", especifica los equipos antiguos a recoger
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              5
            </span>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Genera el PDF
              </h3>
              <p className="text-sm text-gray-600">
                Haz clic en "Generar PDF" y el archivo se descargará automáticamente con el nombre del ticket
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Todos los campos marcados con * son obligatorios.
            El PDF incluirá el logo de Entel y las condiciones de responsabilidad.
          </p>
        </div>
      </div>

      {/* Modal */}
      <ActaFormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};
export default ActasPage;