'use client';

import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';

interface AddFriendModalProps {
  onClose: () => void;
}

export default function AddFriendModal({ onClose }: AddFriendModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al enviar solicitud');
      } else {
        setSuccess('¡Solicitud enviada! Cuando acepte, aparecerá en tu ranking.');
        setEmail('');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="!fixed !inset-0 !z-[9999] !flex !items-center !justify-center !p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="!absolute !inset-0 !bg-black/60 !backdrop-blur-md" />

      {/* Card */}
      <div className="!relative !w-full !max-w-sm !bg-white !rounded-3xl !shadow-2xl !overflow-hidden">

        {/* Gradient top strip */}
        <div className="!h-1.5 !bg-gradient-to-r !from-violet-500 !via-purple-500 !to-fuchsia-500" />

        {/* Content */}
        <div className="!px-7 !pt-7 !pb-8">

          {/* Header row */}
          <div className="!flex !items-start !justify-between !mb-6">
            <div className="!flex !items-center !gap-3">
              <div className="!w-11 !h-11 !rounded-2xl !bg-gradient-to-br !from-violet-500 !to-purple-600 !flex !items-center !justify-center !shadow-lg !shadow-violet-200">
                <span className="!text-xl">🤝</span>
              </div>
              <div>
                <h2 className="!text-gray-900 !font-bold !text-lg !leading-tight">Agregar amigo</h2>
                <p className="!text-gray-400 !text-xs !mt-0.5">Invita a alguien al reto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="!w-8 !h-8 !rounded-full !bg-gray-100 hover:!bg-gray-200 !flex !items-center !justify-center !transition-colors !shrink-0"
            >
              <X className="!w-4 !h-4 !text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="!flex !flex-col !gap-4">
            <div className="!flex !flex-col !gap-1.5">
              <label className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-widest !pl-1">
                Email del amigo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!w-full !px-4 !py-3.5 !bg-gray-50 !border !border-gray-200 !rounded-2xl !text-gray-900 placeholder:!text-gray-300 !outline-none focus:!ring-2 focus:!ring-violet-400 focus:!border-violet-400 focus:!bg-white !transition-all !text-sm"
                placeholder="amigo@email.com"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="!flex !items-center !gap-2.5 !bg-red-50 !border !border-red-100 !text-red-600 !px-4 !py-3 !rounded-2xl !text-sm">
                <span className="!text-base !shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="!flex !items-center !gap-2.5 !bg-emerald-50 !border !border-emerald-100 !text-emerald-700 !px-4 !py-3 !rounded-2xl !text-sm">
                <span className="!text-base !shrink-0">✅</span>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="!w-full !flex !items-center !justify-center !gap-2 !bg-gradient-to-r !from-violet-500 !to-purple-600 !text-white !py-4 !rounded-2xl !font-semibold !text-sm !tracking-wide hover:!opacity-90 active:!scale-[0.98] !transition-all disabled:!opacity-50 disabled:!scale-100 !shadow-lg !shadow-violet-200 !mt-1"
            >
              {loading ? (
                <Loader2 className="!w-4 !h-4 !animate-spin" />
              ) : (
                <>
                  <Send className="!w-4 !h-4" />
                  Enviar invitación
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
