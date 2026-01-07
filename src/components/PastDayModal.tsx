'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type DayUser = {
  id: string;
  name: string;
  avatar: string;
  photoUrl: string | null;
  hasPhoto: boolean;
};

type PastDayModalProps = {
  date: string;
  currentUserId: string;
  onClose: () => void;
};

export default function PastDayModal({ date, currentUserId, onClose }: PastDayModalProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<DayUser[]>([]);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<{ photo_url: string; timestamp: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<DayUser | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(false);

  useEffect(() => {
    const fetchDayData = async () => {
      setLoading(true);
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

  // Usuarios que tienen foto ese día (excepto el usuario actual)
  const usersWithPhotos = users.filter(u => u.hasPhoto && u.id !== currentUserId);

  // La foto del usuario actual para ese día
  const myPhotoUrl = currentUserPhoto?.photo_url 
    ? `${currentUserPhoto.photo_url}?t=${new Date(currentUserPhoto.timestamp).getTime()}`
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <h2 className="text-white font-bold text-lg capitalize">
          {formatDate(date)}
        </h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-6" onClick={(e) => e.stopPropagation()}>
          {/* Mi foto del día */}
          <div className="mb-6">
            <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
              Tu registro
            </h3>
            
            {myPhotoUrl ? (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <div className={`relative aspect-[4/5] ${isHorizontal ? 'bg-black' : 'bg-gray-900'}`}>
                  <img
                    src={myPhotoUrl}
                    alt="Tu foto"
                    onLoad={handleImageLoad}
                    className={`w-full h-full ${isHorizontal ? 'object-contain' : 'object-cover'}`}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 
                                bg-emerald-500 text-white px-2 py-1 rounded-full
                                font-semibold text-xs shadow-lg">
                    ✓ Registrado
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl p-8 border border-red-500/30 text-center">
                <p className="text-5xl mb-3">😔</p>
                <h4 className="text-white font-bold text-lg mb-1">
                  ¡Te saltaste este día!
                </h4>
                <p className="text-white/60 text-sm">
                  No registraste tu visita al gym
                </p>
              </div>
            )}
          </div>

          {/* Amigos que fueron ese día */}
          {usersWithPhotos.length > 0 && (
            <div>
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
                Amigos que fueron ({usersWithPhotos.length})
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {usersWithPhotos.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center
                                  ring-[3px] ring-emerald-400 bg-purple-600">
                      <span className="text-2xl">{user.avatar}</span>
                    </div>
                    <span className="text-white/80 text-xs font-medium truncate max-w-[60px]">
                      {user.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {usersWithPhotos.length === 0 && !myPhotoUrl && (
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <p className="text-white/60 text-sm">
                Nadie registró su visita al gym este día 😴
              </p>
            </div>
          )}
        </div>
      )}

      {/* Story Modal para ver foto de amigo */}
      {selectedUser && selectedUser.photoUrl && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedUser(null)}
        >
          {/* Header con info del usuario */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center ring-2 ring-white/30">
              <span className="text-xl">{selectedUser.avatar}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{selectedUser.name}</p>
              <p className="text-white/60 text-xs capitalize">{formatDate(date)}</p>
            </div>
            <button 
              onClick={() => setSelectedUser(null)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="absolute top-2 left-4 right-4 h-0.5 bg-white/20 rounded-full z-10">
            <div 
              className="h-full bg-white rounded-full"
              style={{ animation: 'storyProgress 5s linear forwards' }}
            />
          </div>

          {/* Imagen */}
          <img
            src={selectedUser.photoUrl}
            alt={`Foto de ${selectedUser.name}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Indicador */}
          <p className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs">
            Toca para cerrar
          </p>
        </div>
      )}
    </div>
  );
}

