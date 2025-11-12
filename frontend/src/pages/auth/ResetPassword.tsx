import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { validarToken, resetearPassword } from '@/features/perfil/services/perfil.service';
import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    password_nueva: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    password_confirmacion: z
      .string()
      .min(1, 'Debes confirmar la contraseña'),
  })
  .refine((data) => data.password_nueva === data.password_confirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmacion'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPasswords, setShowPasswords] = useState({
    nueva: false,
    confirmacion: false,
  });
  const [resetExitoso, setResetExitoso] = useState(false);

  // Validar token al cargar la página
  const { data: tokenData, isLoading: validandoToken, error: tokenError } = useQuery({
    queryKey: ['validar-token', token],
    queryFn: () => validarToken(token!),
    enabled: !!token,
    retry: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: resetearPassword,
    onSuccess: (data) => {
      if (data.success) {
        setResetExitoso(true);
        toast.success('Contraseña restablecida correctamente');
      } else {
        toast.error(data.mensaje);
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.mensaje ||
          'Error al restablecer la contraseña'
      );
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    
    mutation.mutate({
      token,
      password_nueva: data.password_nueva,
    });
  };

  const toggleShowPassword = (field: 'nueva' | 'confirmacion') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Si no hay token, redirigir
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Mostrar loading mientras valida el token
  if (validandoToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Validando token...</p>
        </div>
      </div>
    );
  }

  // Token inválido o expirado
  if (tokenError || !tokenData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Token Inválido o Expirado
              </h2>
              <p className="text-gray-600 mb-6">
                El enlace de recuperación no es válido o ha expirado.
                Por favor, solicita un nuevo enlace.
              </p>
              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Solicitar Nuevo Enlace
                </Link>
                <Link
                  to="/login"
                  className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Volver al Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset exitoso
  if (resetExitoso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Contraseña Restablecida!
              </h2>
              <p className="text-gray-600 mb-6">
                Tu contraseña ha sido actualizada correctamente.
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link
                to="/login"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Ir al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de reset
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Nueva Contraseña
            </h2>
            <p className="text-gray-600">
              Ingresa tu nueva contraseña para{' '}
              <span className="font-semibold">{tokenData?.data?.email}</span>
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('password_nueva')}
                  type={showPasswords.nueva ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('nueva')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.nueva ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password_nueva && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password_nueva.message}
                </p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register('password_confirmacion')}
                  type={showPasswords.confirmacion ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirmacion')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirmacion ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password_confirmacion && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password_confirmacion.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
              Restablecer Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;