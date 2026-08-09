import { Users, UserPlus, Bell, User as UserIcon } from 'lucide-react';
import { User, UserStats } from '@/types';
import { capDays } from '@/lib/stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

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
          <Heading as="h3" size="xl">{user.name}</Heading>
          <Text size="sm" color="secondary">Tu perfil</Text>
        </div>
      </div>

      {myStats && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] rounded-2xl py-3 gap-0 shadow-none text-center">
            <CardContent className="px-3">
              <Text size="2xl" color="accent" weight="black">{capDays(myStats.daysThisWeek)}</Text>
              <Text size="xs" color="muted" className="mt-0.5">Esta sem.</Text>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] rounded-2xl py-3 gap-0 shadow-none text-center">
            <CardContent className="px-3">
              <Text size="2xl" weight="black">{myStats.monthlyDays}</Text>
              <Text size="xs" color="muted" className="mt-0.5">Este mes</Text>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] rounded-2xl py-3 gap-0 shadow-none text-center">
            <CardContent className="px-3">
              <Text size="2xl" weight="black">{myStats.totalDays}</Text>
              <Text size="xs" color="muted" className="mt-0.5">Total 2026</Text>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          onClick={onShowFriendsList}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-start gap-3 p-4 rounded-2xl text-left"
        >
          <Users className="w-5 h-5 text-[#7f0df2]" />
          <Text as="span" size="sm" weight="semibold">Mis amigos</Text>
          {friendsCount > 0 && (
            <Text as="span" size="xs" color="muted" weight="semibold" className="ml-auto">{friendsCount}</Text>
          )}
        </Button>

        <Button
          onClick={onShowAddFriend}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-start gap-3 p-4 rounded-2xl text-left"
        >
          <UserPlus className="w-5 h-5 text-[#7f0df2]" />
          <Text as="span" size="sm" weight="semibold">Agregar amigo</Text>
        </Button>

        <Button
          onClick={onShowNotifications}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-start gap-3 p-4 rounded-2xl text-left relative"
        >
          <Bell className="w-5 h-5 text-[#7f0df2]" />
          <Text as="span" size="sm" weight="semibold">Solicitudes recibidas</Text>
          {pendingRequestsCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
              {pendingRequestsCount}
            </span>
          )}
        </Button>

        <Button
          onClick={onLogout}
          className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-start gap-3 p-4 rounded-2xl text-left"
        >
          <UserIcon className="w-5 h-5 text-red-400" />
          <Text as="span" size="sm" color="danger" weight="semibold">Cerrar sesión</Text>
        </Button>
      </div>
    </div>
  );
}
