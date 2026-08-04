'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { formatDate, formatTimeChile } from '@/lib/date';
import { DayUser, EntryData } from '@/types';
import StoryViewer from './StoryViewer';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

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
        overlayClassName="!bg-black/90 !backdrop-blur-sm"
        className="!fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !w-full !max-w-none !rounded-none !border-0 !bg-transparent !p-0 !shadow-none !flex !flex-col"
        onClick={onClose}
      >
        {/* Header */}
        <div className="!flex !items-center !justify-between !p-4 !bg-gradient-to-b !from-black/60 !to-transparent">
          <DialogTitle className="!text-white !font-bold !text-lg !capitalize">
            {formatDate(date)}
          </DialogTitle>
          <button
            onClick={onClose}
            className="!w-10 !h-10 !rounded-full !bg-white/10 !flex !items-center !justify-center hover:!bg-white/20 !transition-colors"
          >
            <X className="!w-5 !h-5 !text-white" />
          </button>
        </div>

        {loading ? (
          <div className="!flex-1 !flex !items-center !justify-center">
            <Loader2 className="!w-10 !h-10 !text-white !animate-spin" />
          </div>
        ) : (
          <div className="!flex-1 !overflow-y-auto !px-4 !pb-6" onClick={(e) => e.stopPropagation()}>
            {/* Mi foto del día */}
            <div className="!mb-6">
              <div className="!flex !items-center !justify-between !mb-3">
                <h3 className="!text-white/60 !text-xs !font-bold !uppercase !tracking-wider">
                  Tu registro
                </h3>
                {currentUserPhoto?.timestamp && (
                  <span className="!text-white/40 !text-xs">
                    {formatTimeChile(currentUserPhoto.timestamp)}
                  </span>
                )}
              </div>

              {myPhotoUrl ? (
                <div className="!rounded-2xl !overflow-hidden !shadow-xl">
                  <div className={`!relative !aspect-[4/5] ${isHorizontal ? '!bg-black' : '!bg-gray-900'}`}>
                    {myPhotoLoading && (
                      <div className="!absolute !inset-0 !flex !items-center !justify-center !z-10">
                        <div className="!w-16 !h-16 !rounded-full !bg-white/20 !flex !items-center !justify-center">
                          <Loader2 className="!w-8 !h-8 !text-white !animate-spin" />
                        </div>
                      </div>
                    )}
                    <img
                      src={myPhotoUrl}
                      alt="Tu foto"
                      onLoad={(e) => {
                        handleImageLoad(e);
                        setMyPhotoLoading(false);
                      }}
                      onError={() => setMyPhotoLoading(false)}
                      className={`!w-full !h-full ${isHorizontal ? '!object-contain' : '!object-cover'} ${myPhotoLoading ? '!opacity-0' : '!opacity-100 !transition-opacity !duration-300'}`}
                    />
                    <div className="!absolute !top-2 !right-2 !flex !items-center !gap-1.5
                                  !bg-emerald-500 !text-white !px-2 !py-1 !rounded-full
                                  !font-semibold !text-xs !shadow-lg">
                      ✓ Registrado
                    </div>
                  </div>
                </div>
              ) : (
                <div className="!bg-gradient-to-br !from-red-500/20 !to-orange-500/20 !rounded-2xl !p-8 !border !border-red-500/30 !text-center">
                  <p className="!text-5xl !mb-3">😔</p>
                  <h4 className="!text-white !font-bold !text-lg !mb-1">
                    ¡Te saltaste este día!
                  </h4>
                  <p className="!text-white/60 !text-sm">
                    No registraste tu visita al gym
                  </p>
                </div>
              )}
            </div>

            {/* Amigos que fueron ese día */}
            {usersWithPhotos.length > 0 && (
              <div>
                <h3 className="!text-white/60 !text-xs !font-bold !uppercase !tracking-wider !mb-3">
                  Amigos que fueron ({usersWithPhotos.length})
                </h3>

                <div className="!flex !flex-wrap !gap-3">
                  {usersWithPhotos.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="!flex !flex-col !items-center !gap-1 !p-2 !rounded-xl hover:!bg-white/10 !transition-colors"
                    >
                      <div className="!relative !w-14 !h-14 !rounded-full !flex !items-center !justify-center
                                    !ring-[3px] !ring-emerald-400 !bg-purple-600">
                        <span className="!text-2xl">{user.avatar}</span>
                      </div>
                      <span className="!text-white/80 !text-xs !font-medium !truncate !max-w-[60px]">
                        {user.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {usersWithPhotos.length === 0 && !myPhotoUrl && (
              <div className="!bg-white/5 !rounded-2xl !p-6 !text-center !border !border-white/10">
                <p className="!text-white/60 !text-sm">
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
