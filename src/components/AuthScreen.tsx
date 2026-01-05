'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signup') {
        if (name.trim().length < 2) {
          throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        
        setSuccess('¡Cuenta creada! Ya puedes usar la app.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Traducir errores comunes
      const errorMessage = err instanceof Error ? err.message : 'Error al autenticar';
      let message = errorMessage;
      if (message.includes('Invalid login credentials')) {
        message = 'Email o contraseña incorrectos';
      } else if (message.includes('Email not confirmed')) {
        message = 'Debes confirmar tu email primero';
      } else if (message.includes('User already registered')) {
        message = 'Este email ya está registrado';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center !p-4">
      <div className="bg-white !rounded-3xl shadow-2xl !p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center !mb-8">
          <div className="!text-6xl !mb-4">🏋️</div>
          <h1 className="!text-3xl !font-bold text-gray-800 !mb-2">
            Gym Challenge
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear tu cuenta'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="!space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block !text-sm !font-medium text-gray-700 !mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-violet-500 focus:!border-transparent outline-none text-gray-900"
                placeholder="Tu nombre"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className="block !text-sm !font-medium text-gray-700 !mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-violet-500 focus:!border-transparent outline-none text-gray-900"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block !text-sm !font-medium text-gray-700 !mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full !px-4 !py-3 !border !border-gray-300 !rounded-xl focus:!ring-2 focus:!ring-violet-500 focus:!border-transparent outline-none text-gray-900"
              placeholder="••••••••"
              required
              minLength={6}
            />
            {mode === 'signup' && (
              <p className="!text-xs text-gray-500 !mt-1">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {error && (
            <div className="!bg-red-50 !border !border-red-200 text-red-700 !px-4 !py-3 !rounded-xl !text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="!bg-emerald-50 !border !border-emerald-200 text-emerald-700 !px-4 !py-3 !rounded-xl !text-sm">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full !bg-gradient-to-r !from-violet-500 !to-purple-600 !text-white !py-3 !rounded-xl !font-semibold !text-lg hover:!scale-105 transition-transform active:!scale-95 disabled:!opacity-50 disabled:!scale-100 !h-14"
          >
            {loading ? (
              <Loader2 className="!w-5 !h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="!mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setSuccess('');
            }}
            className="text-violet-600 hover:text-violet-700 !text-sm !font-medium"
          >
            {mode === 'login' 
              ? '¿No tienes cuenta? Regístrate' 
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

