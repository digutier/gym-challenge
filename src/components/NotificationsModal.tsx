'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { FriendRequest } from '@/types';

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
              <div className="!w-11 !h-11 !rounded-2xl !bg-gradient-to-br !from-violet-500 !to-purple-600 !flex !items-center !justify-center !shadow-lg !shadow-violet-200 !relative">
                <span className="!text-xl">🔔</span>
                {!isEmpty && (
                  <span className="!absolute !-top-1.5 !-right-1.5 !w-5 !h-5 !bg-red-500 !text-white !text-[10px] !font-bold !rounded-full !flex !items-center !justify-center">
                    {localRequests.length}
                  </span>
                )}
              </div>
              <div>
                <h2 className="!text-gray-900 !font-bold !text-lg !leading-tight">Solicitudes</h2>
                <p className="!text-gray-400 !text-xs !mt-0.5">
                  {isEmpty ? 'Sin solicitudes pendientes' : `${localRequests.length} pendiente${localRequests.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="!w-8 !h-8 !rounded-full !bg-gray-100 hover:!bg-gray-200 !flex !items-center !justify-center !transition-colors !shrink-0"
            >
              <X className="!w-4 !h-4 !text-gray-500" />
            </button>
          </div>

          {/* Empty state */}
          {isEmpty ? (
            <div className="!flex !flex-col !items-center !gap-3 !py-6 !text-center">
              <div className="!w-16 !h-16 !rounded-full !bg-gray-50 !flex !items-center !justify-center !text-3xl">
                🤝
              </div>
              <div>
                <p className="!text-gray-700 !font-semibold !text-sm">Todo al día</p>
                <p className="!text-gray-400 !text-xs !mt-1 !leading-relaxed">
                  Cuando alguien te envíe una solicitud de amistad, aparecerá aquí.
                </p>
              </div>
            </div>
          ) : (
            <ul className="!flex !flex-col !gap-3">
              {localRequests.map((req) => (
                <li
                  key={req.id}
                  className="!flex !items-center !gap-3 !p-4 !bg-gray-50 !border !border-gray-100 !rounded-2xl"
                >
                  <span className="!text-3xl !shrink-0 !leading-none">{req.requester.avatar}</span>
                  <div className="!flex-1 !min-w-0">
                    <p className="!font-semibold !text-gray-800 !text-sm !truncate">{req.requester.name}</p>
                    <p className="!text-gray-400 !text-xs !truncate !mt-0.5">{req.requester.email}</p>
                  </div>
                  <div className="!shrink-0">
                    {processingId === req.id ? (
                      <Loader2 className="!w-5 !h-5 !animate-spin !text-gray-400" />
                    ) : (
                      <div className="!flex !gap-2">
                        <button
                          onClick={() => handleRespond(req.id, 'accept')}
                          className="!flex !items-center !gap-1.5 !px-3.5 !py-2 !bg-emerald-500 hover:!bg-emerald-600 !text-white !text-xs !font-semibold !rounded-xl !transition-colors active:!scale-95"
                        >
                          <Check className="!w-3.5 !h-3.5" />
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleRespond(req.id, 'decline')}
                          className="!px-3.5 !py-2 !bg-gray-100 hover:!bg-gray-200 !text-gray-500 !text-xs !font-semibold !rounded-xl !transition-colors active:!scale-95"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
