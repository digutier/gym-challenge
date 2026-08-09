'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authScreen as styles } from './AuthScreen.styles';

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
    <div className={styles.root}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerEmoji}>🏋️</div>
          <h1 className={styles.headerTitle}>
            Gym Challenge
          </h1>
          <p className={styles.headerSubtitle}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear tu cuenta'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div>
              <label className={styles.fieldLabel}>
                Nombre
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Tu nombre"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className={styles.fieldLabel}>
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              minLength={6}
            />
            {mode === 'signup' && (
              <p className={styles.passwordHint}>
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successBox}>
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'login' ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </form>

        {/* Toggle mode */}
        <div className={styles.toggleWrap}>
          <Button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setSuccess('');
            }}
            className={styles.toggleButton}
          >
            {mode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </Button>
        </div>
      </div>
    </div>
  );
}

