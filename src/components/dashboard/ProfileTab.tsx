import { Users, UserPlus, Bell, User as UserIcon } from 'lucide-react';
import { User, UserStats } from '@/types';
import { capDays } from '@/lib/stats';

interface ProfileTabProps {
  user: User;
  ranking: UserStats[];
  friendsCount: number;
  pendingRequestsCount: number;
  onShowFriendsList: () => void;
  onShowAddFriend: () => void;
  onShowNotifications: () => void;
  onLogout: () => void;
}

export default function ProfileTab({
  user,
  ranking,
  friendsCount,
  pendingRequestsCount,
  onShowFriendsList,
  onShowAddFriend,
  onShowNotifications,
  onLogout,
}: ProfileTabProps) {
  const myStats = ranking.find(u => u.id === user.id);

  return (
    <div className="flex flex-col gap-5 px-4 pb-6 pt-4 lg:max-w-[640px] lg:mx-auto lg:w-full lg:px-6">
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="bg-[rgba(127,13,242,0.2)] border-2 border-[rgba(127,13,242,0.5)] rounded-full size-20 flex items-center justify-center text-4xl">
          {user.avatar}
        </div>
        <div className="text-center">
          <h3 className="text-[#f1f5f9] text-xl font-bold">{user.name}</h3>
          <p className="text-[#94a3b8] text-sm">Tu perfil</p>
        </div>
      </div>

      {myStats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-3 text-center">
            <p className="text-[#7f0df2] text-2xl font-black">{capDays(myStats.daysThisWeek)}</p>
            <p className="text-[#64748b] text-xs mt-0.5">Esta sem.</p>
          </div>
          <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-3 text-center">
            <p className="text-[#f1f5f9] text-2xl font-black">{myStats.monthlyDays}</p>
            <p className="text-[#64748b] text-xs mt-0.5">Este mes</p>
          </div>
          <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-3 text-center">
            <p className="text-[#f1f5f9] text-2xl font-black">{myStats.totalDays}</p>
            <p className="text-[#64748b] text-xs mt-0.5">Total 2026</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={onShowFriendsList}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left"
        >
          <Users className="w-5 h-5 text-[#7f0df2]" />
          <span className="text-[#f1f5f9] text-sm font-semibold">Mis amigos</span>
          {friendsCount > 0 && (
            <span className="ml-auto text-[#64748b] text-xs font-semibold">{friendsCount}</span>
          )}
        </button>

        <button
          onClick={onShowAddFriend}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left"
        >
          <UserPlus className="w-5 h-5 text-[#7f0df2]" />
          <span className="text-[#f1f5f9] text-sm font-semibold">Agregar amigo</span>
        </button>

        <button
          onClick={onShowNotifications}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left relative"
        >
          <Bell className="w-5 h-5 text-[#7f0df2]" />
          <span className="text-[#f1f5f9] text-sm font-semibold">Solicitudes recibidas</span>
          {pendingRequestsCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          onClick={onLogout}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left"
        >
          <UserIcon className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
