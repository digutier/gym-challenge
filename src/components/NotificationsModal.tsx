'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { FriendRequest } from '@/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-[#f1f5f9] text-lg font-bold">Solicitudes recibidas</DialogTitle>
            <DialogDescription className="text-[#64748b] text-sm">
              {isEmpty ? 'Sin solicitudes pendientes' : `${localRequests.length} pendiente${localRequests.length > 1 ? 's' : ''}`}
            </DialogDescription>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-5xl">🤝</span>
            <div>
              <p className="text-[#f1f5f9] text-sm font-semibold">Todo al día</p>
              <p className="text-[#64748b] text-xs mt-1 leading-relaxed">
                Cuando alguien te envíe una solicitud de amistad, aparecerá aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {localRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 p-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-2xl"
              >
                <span className="text-2xl shrink-0 leading-none">{req.requester.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f1f5f9] text-sm font-semibold truncate">{req.requester.name}</p>
                  <p className="text-[#64748b] text-xs truncate mt-0.5">{req.requester.email}</p>
                </div>
                <div className="shrink-0">
                  {processingId === req.id ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#64748b]" />
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(req.id, 'accept')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-xl active:scale-95 transition-transform"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, 'decline')}
                        className="px-3 py-2 border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-xs font-semibold rounded-xl active:scale-95 transition-transform"
                      >
                        No
                      </button>
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
