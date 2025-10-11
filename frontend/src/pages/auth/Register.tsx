import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { isValidEmail, isValidPassword, isValidName, validationMessages } from '../../utils/validators';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol_id: '',
  });

  const [errors, setErrors] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol_id: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Roles disponibles
  const roles = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
    { id: 2, nombre: 'Gestor', descripcion: 'Gestión de inventario y productos' },
    { id: 3, nombre: 'Operador', descripcion: 'Solo lectura y operaciones básicas' },
  ];

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
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
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      rol_id: '',
    };

    let isValid = true;

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = validationMessages.name.required;
      isValid = false;
    } else if (!isValidName(formData.nombre)) {
      newErrors.nombre = validationMessages.name.invalid;
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = validationMessages.email.required;
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = validationMessages.email.invalid;
      isValid = false;
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = validationMessages.password.required;
      isValid = false;
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = validationMessages.password.invalid;
      isValid = false;
    }

    // Validar confirmación de password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = validationMessages.password.mismatch;
      isValid = false;
    }

    // Validar rol
    if (!formData.rol_id) {
      newErrors.rol_id = validationMessages.role.required;
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
      const result = await register({
        nombre: formData.nombre.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        rol_id: parseInt(formData.rol_id),
      });

      if (result.success) {
        setAlertMessage({
          type: 'success',
          message: result.message + ' Redirigiendo al login...',
        });
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setAlertMessage({
          type: 'error',
          message: result.message,
        });
      }
    } catch (error: any) {
      setAlertMessage({
        type: 'error',
        message: error.message || 'Error al registrar usuario. Intenta nuevamente.',
      });
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
            Crear Cuenta Nueva
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
            {/* Nombre */}
            <Input
              label="Nombre Completo"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              icon={<User className="h-5 w-5 text-gray-400" />}
              placeholder="Juan Pérez"
              autoComplete="name"
              disabled={isLoading}
            />

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
                autoComplete="new-password"
                disabled={isLoading}
              />
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
              {/* Indicador de fortaleza */}
              <PasswordStrength password={formData.password} />
            </div>

            {/* Confirmar Password */}
            <div className="relative">
              <Input
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
              />
              {formData.confirmPassword && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>

            {/* Selector de Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                  name="rol_id"
                  value={formData.rol_id}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all
                    ${errors.rol_id ? 'border-danger' : 'border-gray-300'}
                  `}
                  disabled={isLoading}
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre} - {rol.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              {errors.rol_id && (
                <p className="mt-1 text-sm text-danger">{errors.rol_id}</p>
              )}
            </div>

            {/* Botón de submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Link a login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-blue-600 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          © 2025 Sistema de Inventarios. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Register;