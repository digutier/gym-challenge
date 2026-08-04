'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar amigo</DialogTitle>
          <DialogDescription>Invita a tu amigo registrado por email</DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#64748b] text-[11px] font-semibold uppercase tracking-widest">
              Email del amigo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-2xl text-[#f1f5f9] placeholder:text-[#334155] outline-none focus:border-[#7f0df2] focus:ring-1 focus:ring-[#7f0df2] transition-all text-sm"
              placeholder="amigo@email.com"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {success && (
            <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <p className="text-emerald-400 text-xs">{success}</p>
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-[#7f0df2] text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(127,13,242,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
