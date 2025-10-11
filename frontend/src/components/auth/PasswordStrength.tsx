import React from 'react';
import { getPasswordStrength } from '../../utils/validators';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  const strengthConfig = {
    weak: {
      label: 'Débil',
      color: 'bg-red-500',
      width: 'w-1/3',
      textColor: 'text-red-600',
    },
    medium: {
      label: 'Media',
      color: 'bg-yellow-500',
      width: 'w-2/3',
      textColor: 'text-yellow-600',
    },
    strong: {
      label: 'Fuerte',
      color: 'bg-green-500',
      width: 'w-full',
      textColor: 'text-green-600',
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Fortaleza de contraseña:</span>
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${config.color} h-2 rounded-full transition-all duration-300 ${config.width}`}
        />
      </div>
    </div>
  );
};

export default PasswordStrength;