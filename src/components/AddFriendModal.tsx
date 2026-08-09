'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { addFriendModal as styles } from '@/components/styles/modals';

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
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldWrap}>
            <Text as="label" size="11px" color="muted" weight="semibold" className="uppercase tracking-widest">
              Email del amigo
            </Text>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              placeholder="amigo@email.com"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className={styles.errorBox}>
              <Text size="xs" color="danger">{error}</Text>
            </div>
          )}

          {success && (
            <div className={styles.successBox}>
              <Text size="xs" color="success">{success}</Text>
            </div>
          )}

          <div className={styles.buttonRow}>
            <Button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
