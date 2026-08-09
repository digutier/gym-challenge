'use client';

import { useState } from 'react';
import { X, Loader2, UserMinus } from 'lucide-react';
import { Friend } from '@/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { modalHeaderRow, modalHeaderTextWrap, modalCloseButton, modalEmptyState, modalRow, modalRowAvatar, modalRowTextWrap, friendsListModal as styles } from '@/components/styles/modals';

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
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          {/* Header */}
          <div className={modalHeaderRow}>
            <div className={modalHeaderTextWrap}>
              <DialogTitle className="text-[#f1f5f9] text-lg font-bold">Mis amigos</DialogTitle>
              <DialogDescription className="text-[#64748b] text-sm">
                {isEmpty ? 'Aún no tienes amigos' : `${localFriends.length} amigo${localFriends.length > 1 ? 's' : ''}`}
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
              <span className="text-5xl">👥</span>
              <div>
                <Text size="sm" weight="semibold">Sin amigos aún</Text>
                <Text size="xs" color="muted" className="mt-1 leading-relaxed">
                  Agrega amigos por email para competir en el ranking juntos.
                </Text>
              </div>
            </div>
          ) : (
            <div className={styles.listWrap}>
              {localFriends.map((friend) => (
                <div
                  key={friend.friendshipId}
                  className={modalRow}
                >
                  <span className={modalRowAvatar}>{friend.avatar}</span>
                  <div className={modalRowTextWrap}>
                    <Text size="sm" weight="semibold" className="truncate">{friend.name}</Text>
                    <Text size="xs" color="muted" className="truncate mt-0.5">{friend.email}</Text>
                  </div>
                  <Button
                    onClick={() => setConfirmRemove(friend)}
                    className={styles.removeButton}
                  >
                    <UserMinus className="w-4 h-4 text-[#64748b]" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm remove modal */}
      <AlertDialog
        open={!!confirmRemove}
        onOpenChange={(open) => { if (!open && !removing) setConfirmRemove(null); }}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="text-[#f1f5f9] text-lg font-bold">Eliminar amigo</AlertDialogTitle>
          <AlertDialogDescription className="text-[#94a3b8] text-sm">
            ¿Estás seguro que quieres eliminar a <Text as="span" weight="semibold">{confirmRemove?.name}</Text> de tus amigos? Dejarán de verse en el ranking del otro.
          </AlertDialogDescription>
          <div className={styles.confirmButtonRow}>
            <Button
              onClick={() => setConfirmRemove(null)}
              disabled={removing}
              className={styles.confirmCancelButton}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRemove}
              disabled={removing}
              className={styles.confirmDeleteButton}
            >
              {removing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Sí, eliminar'
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
