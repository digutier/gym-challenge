'use client';

import { useState } from 'react';
import { X, Loader2, UserMinus } from 'lucide-react';

interface Friend {
  friendshipId: string;
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface FriendsListModalProps {
  friends: Friend[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function FriendsListModal({ friends, onClose, onRefresh }: FriendsListModalProps) {
  const [localFriends, setLocalFriends] = useState<Friend[]>(friends);
  const [confirmRemove, setConfirmRemove] = useState<Friend | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    try {
      const res = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId: confirmRemove.friendshipId }),
      });
      if (res.ok) {
        setLocalFriends(prev => prev.filter(f => f.friendshipId !== confirmRemove.friendshipId));
        onRefresh();
      }
    } catch { /* ignore */ } finally {
      setRemoving(false);
      setConfirmRemove(null);
    }
  };

  const isEmpty = localFriends.length === 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#1e1130] border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[#f1f5f9] text-lg font-bold">Mis amigos</p>
              <p className="text-[#64748b] text-sm">
                {isEmpty ? 'Aún no tienes amigos' : `${localFriends.length} amigo${localFriends.length > 1 ? 's' : ''}`}
              </p>
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
              <span className="text-5xl">👥</span>
              <div>
                <p className="text-[#f1f5f9] text-sm font-semibold">Sin amigos aún</p>
                <p className="text-[#64748b] text-xs mt-1 leading-relaxed">
                  Agrega amigos por email para competir en el ranking juntos.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
              {localFriends.map((friend) => (
                <div
                  key={friend.friendshipId}
                  className="flex items-center gap-3 p-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-2xl"
                >
                  <span className="text-2xl shrink-0 leading-none">{friend.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#f1f5f9] text-sm font-semibold truncate">{friend.name}</p>
                    <p className="text-[#64748b] text-xs truncate mt-0.5">{friend.email}</p>
                  </div>
                  <button
                    onClick={() => setConfirmRemove(friend)}
                    className="shrink-0 w-8 h-8 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <UserMinus className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm remove modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !removing && setConfirmRemove(null)} />
          <div className="relative bg-[#1e1130] border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <p className="text-[#f1f5f9] text-lg font-bold">Eliminar amigo</p>
            <p className="text-[#94a3b8] text-sm">
              ¿Estás seguro que quieres eliminar a <span className="text-[#f1f5f9] font-semibold">{confirmRemove.name}</span> de tus amigos? Dejarán de verse en el ranking del otro.
            </p>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setConfirmRemove(null)}
                disabled={removing}
                className="flex-1 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(239,68,68,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {removing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
