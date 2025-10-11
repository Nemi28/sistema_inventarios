import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-400" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-400" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div className={`${currentStyle.bg} ${currentStyle.border} border rounded-lg p-4 animate-fadeIn`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{currentStyle.icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${currentStyle.text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 inline-flex ${currentStyle.text} hover:opacity-75 focus:outline-none`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;