import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { isValidEmail } from '../../utils/validators';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Limpiar alerta
    if (alertMessage) {
      setAlertMessage(null);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    };

    let isValid = true;

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
      isValid = false;
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setAlertMessage(null);

    try {
      const result = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      if (result.success) {
        setAlertMessage({
          type: 'success',
          message: result.message,
        });
        
        // Redirigir al dashboard después de 1 segundo
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setAlertMessage({
          type: 'error',
          message: result.message,
        });
        // Limpiar contraseña por seguridad
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error: any) {
      setAlertMessage({
        type: 'error',
        message: error.message || 'Error al iniciar sesión. Intenta nuevamente.',
      });
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Sistema de Inventarios
          </h2>
          <p className="text-gray-400 text-lg">
            Iniciar Sesión
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6 animate-fadeIn">
          {/* Alerta */}
          {alertMessage && (
            <Alert
              type={alertMessage.type}
              message={alertMessage.message}
              onClose={() => setAlertMessage(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <Input
              label="Correo Electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Password */}
            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
              {/* Botón mostrar/ocultar contraseña */}
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>

            {/* Botón de submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>
            {/* Link olvidé mi contraseña */}
<div className="text-center">
  <Link
    to="/forgot-password"
    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
  >
    ¿Olvidaste tu contraseña?
  </Link>
</div>
          </form>

          {/* Link a registro 
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-blue-600 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>*/}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          © 2025 Sistema de Inventarios. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;