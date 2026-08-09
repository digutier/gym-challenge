'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { FriendRequest } from '@/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { modalHeaderRow, modalHeaderTextWrap, modalCloseButton, modalEmptyState, modalRow, modalRowAvatar, modalRowTextWrap, notificationsModal as styles } from '@/components/styles/modals';

interface NotificationsModalProps {
  requests: FriendRequest[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function NotificationsModal({ requests, onClose, onRefresh }: NotificationsModalProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [localRequests, setLocalRequests] = useState<FriendRequest[]>(requests);

  const handleRespond = async (friendshipId: string, action: 'accept' | 'decline') => {
    setProcessingId(friendshipId);

    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action }),
      });

      if (res.ok) {
        setLocalRequests(prev => prev.filter(r => r.id !== friendshipId));
        onRefresh();
      }
    } catch {
      // silently fail
    } finally {
      setProcessingId(null);
    }
  };

  const isEmpty = localRequests.length === 0;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {/* Header */}
        <div className={modalHeaderRow}>
          <div className={modalHeaderTextWrap}>
            <DialogTitle className="text-[#f1f5f9] text-lg font-bold">Solicitudes recibidas</DialogTitle>
            <DialogDescription className="text-[#64748b] text-sm">
              {isEmpty ? 'Sin solicitudes pendientes' : `${localRequests.length} pendiente${localRequests.length > 1 ? 's' : ''}`}
            </DialogDescription>
          </div>
          <Button
            onClick={onClose}
            className={modalCloseButton}
          >
            <X className="w-4 h-4 text-[#64748b]" />
          </Button>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className={modalEmptyState}>
            <span className="text-5xl">🤝</span>
            <div>
              <Text size="sm" weight="semibold">Todo al día</Text>
              <Text size="xs" color="muted" className="mt-1 leading-relaxed">
                Cuando alguien te envíe una solicitud de amistad, aparecerá aquí.
              </Text>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {localRequests.map((req) => (
              <div
                key={req.id}
                className={modalRow}
              >
                <span className={modalRowAvatar}>{req.requester.avatar}</span>
                <div className={modalRowTextWrap}>
                  <Text size="sm" weight="semibold" className="truncate">{req.requester.name}</Text>
                  <Text size="xs" color="muted" className="truncate mt-0.5">{req.requester.email}</Text>
                </div>
                <div className="shrink-0">
                  {processingId === req.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#64748b]" />
                  ) : (
                    <div className={styles.actionsWrap}>
                      <Button
                        onClick={() => handleRespond(req.id, 'accept')}
                        className={styles.acceptButton}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aceptar
                      </Button>
                      <Button
                        onClick={() => handleRespond(req.id, 'decline')}
                        className={styles.declineButton}
                      >
                        No
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
