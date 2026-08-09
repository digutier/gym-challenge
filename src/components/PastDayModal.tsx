'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { formatDate, formatTimeChile } from '@/lib/date';
import { DayUser, EntryData } from '@/types';
import StoryViewer from './StoryViewer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pastDayModal as styles } from '@/components/styles/photo-viewer';

type PastDayModalProps = {
  date: string;
  currentUserId: string;
  onClose: () => void;
};

export default function PastDayModal({ date, currentUserId, onClose }: PastDayModalProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<DayUser[]>([]);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<EntryData | null>(null);
  const [selectedUser, setSelectedUser] = useState<DayUser | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [myPhotoLoading, setMyPhotoLoading] = useState(true);

  useEffect(() => {
    const fetchDayData = async () => {
      setLoading(true);
      setMyPhotoLoading(true);
      try {
        const response = await fetch(`/api/day-stats?date=${date}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          setCurrentUserPhoto(data.currentUserPhoto);
        }
      } catch (error) {
        console.error('Error fetching day data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDayData();
  }, [date]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setIsHorizontal(aspectRatio > 1);
  };

  const usersWithPhotos = users.filter(u => u.hasPhoto && u.id !== currentUserId);

  const myPhotoUrl = currentUserPhoto?.photo_url
    ? `${currentUserPhoto.photo_url}?t=${new Date(currentUserPhoto.timestamp).getTime()}`
    : null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName={styles.overlayClassName}
        className={styles.contentClassName}
        onClick={onClose}
      >
        {/* Header */}
        <div className={styles.headerBar}>
          <DialogTitle className="text-white font-bold text-lg capitalize">
            {formatDate(date)}
          </DialogTitle>
          <Button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        ) : (
          <div className={styles.scrollWrap} onClick={(e) => e.stopPropagation()}>
            {/* Mi foto del día */}
            <div className={styles.sectionWrap}>
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionLabel}>
                  Tu registro
                </h3>
                {currentUserPhoto?.timestamp && (
                  <span className={styles.sectionTimestamp}>
                    {formatTimeChile(currentUserPhoto.timestamp)}
                  </span>
                )}
              </div>

              {myPhotoUrl ? (
                <div className={styles.photoCardWrap}>
                  <div className={styles.photoFrame(isHorizontal)}>
                    {myPhotoLoading && (
                      <div className={styles.photoLoadingOverlay}>
                        <div className={styles.photoLoadingCircle}>
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      </div>
                    )}
                    <Image
                      src={myPhotoUrl}
                      alt="Tu foto"
                      fill
                      sizes="(min-width: 1024px) 640px, 100vw"
                      onLoad={(e) => {
                        handleImageLoad(e);
                        setMyPhotoLoading(false);
                      }}
                      onError={() => setMyPhotoLoading(false)}
                      className={styles.photoImage(isHorizontal, myPhotoLoading)}
                    />
                    <div className={styles.registeredBadge}>
                      ✓ Registrado
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.missedCard}>
                  <p className={styles.missedEmoji}>😔</p>
                  <h4 className={styles.missedTitle}>
                    ¡Te saltaste este día!
                  </h4>
                  <p className={styles.missedSubtitle}>
                    No registraste tu visita al gym
                  </p>
                </div>
              )}
            </div>

            {/* Amigos que fueron ese día */}
            {usersWithPhotos.length > 0 && (
              <div>
                <h3 className={styles.friendsLabel}>
                  Amigos que fueron ({usersWithPhotos.length})
                </h3>

                <div className={styles.friendsGrid}>
                  {usersWithPhotos.map((user) => (
                    <Button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={styles.friendButton}
                    >
                      <div className={styles.friendAvatar}>
                        <span className="text-2xl">{user.avatar}</span>
                      </div>
                      <span className={styles.friendName}>
                        {user.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {usersWithPhotos.length === 0 && !myPhotoUrl && (
              <div className={styles.emptyDayCard}>
                <p className={styles.emptyDayText}>
                  Nadie registró su visita al gym este día 😴
                </p>
              </div>
            )}
          </div>
        )}

        {/* Story Modal para ver foto de amigo */}
        {selectedUser && selectedUser.photoUrl && (
          <StoryViewer
            avatar={selectedUser.avatar}
            name={selectedUser.name}
            photoUrl={selectedUser.photoUrl}
            subtitle={formatDate(date)}
            timestamp={selectedUser.photoTimestamp ?? undefined}
            avatarBgClassName="!bg-purple-600"
            onClose={(e) => {
              e?.stopPropagation(); // Evita que se cierre el PastDayModal
              setSelectedUser(null); // Solo cierra el story
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
