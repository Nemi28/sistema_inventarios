import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuiaFormModal } from './GuiaFormModal';

export const GuiasPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Guías de Remisión
          </h1>
          <p className="text-gray-500 mt-2">
            Genera guías de envío y recojo en formato Excel
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nueva Guía
        </Button>
      </div>

      {/* Información */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900">Tipo de Guía</h3>
              <p className="text-sm text-gray-600">
                Selecciona si es una guía de <strong>envío</strong> (productos a
                tienda) o <strong>recojo</strong> (productos desde tienda).
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900">
                Completa los Datos
              </h3>
              <p className="text-sm text-gray-600">
                Ingresa la fecha, tienda, número de orden y agrega los SKUs con
                sus cantidades y series.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900">Descarga Excel</h3>
              <p className="text-sm text-gray-600">
                El sistema generará un archivo Excel con todos los datos
                pre-rellenados listo para usar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Guía de Envío
              </h3>
              <p className="text-sm text-blue-800">
                Para enviar productos <strong>hacia una tienda</strong>. El
                destino será la tienda seleccionada y el origen será el almacén
                central.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                Guía de Recojo
              </h3>
              <p className="text-sm text-green-800">
                Para recoger productos <strong>desde una tienda</strong>. El
                origen será la tienda seleccionada y el destino será el almacén
                central.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center border">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          ¿Listo para generar tu primera guía?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Haz clic en el botón "Nueva Guía" para comenzar. El proceso es rápido
          y sencillo.
        </p>
        <Button onClick={() => setModalOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Generar Guía Ahora
        </Button>
      </div>

      {/* Modal de formulario */}
      <GuiaFormModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};