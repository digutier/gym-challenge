import { Images, Users, UserPlus, Bell, User as UserIcon } from 'lucide-react';
import { User, UserStats } from '@/types';
import { capDays } from '@/lib/stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { profileTab as styles } from './styles';

interface ProfileTabProps {
  user: User;
  ranking: UserStats[];
  friendsCount: number;
  pendingRequestsCount: number;
  onShowGymHistory: () => void;
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
  onShowGymHistory,
  onShowFriendsList,
  onShowAddFriend,
  onShowNotifications,
  onLogout,
}: ProfileTabProps) {
  const myStats = ranking.find(u => u.id === user.id);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.avatar}
        </div>
        <div className={styles.headerTextWrap}>
          <Heading as="h3" size="xl">{user.name}</Heading>
          <Text size="sm" color="secondary">Tu perfil</Text>
        </div>
      </div>

      {myStats && (
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <CardContent className={styles.statCardContent}>
              <Text size="2xl" color="accent" weight="black">{capDays(myStats.daysThisWeek)}</Text>
              <Text size="xs" color="muted" className="mt-0.5">Esta sem.</Text>
            </CardContent>
          </Card>
          <Card className={styles.statCard}>
            <CardContent className={styles.statCardContent}>
              <Text size="2xl" weight="black">{myStats.monthlyDays}</Text>
              <Text size="xs" color="muted" className="mt-0.5">Este mes</Text>
            </CardContent>
          </Card>
          <Card className={styles.statCard}>
            <CardContent className={styles.statCardContent}>
              <Text size="2xl" weight="black">{myStats.totalDays}</Text>
              <Text size="xs" color="muted" className="mt-0.5">Total 2026</Text>
            </CardContent>
          </Card>
        </div>
      )}

      <div className={styles.menuList}>
        <Button
          onClick={onShowGymHistory}
          className={styles.menuButton}
        >
          <Images className="w-5 h-5 text-[#7f0df2]" />
          <Text as="span" size="sm" weight="semibold">Historial de fotos</Text>
        </Button>

        <Button
          onClick={onShowFriendsList}
          className={styles.menuButton}
        >
          <Users className="w-5 h-5 text-[#7f0df2]" />
          <Text as="span" size="sm" weight="semibold">Mis amigos</Text>
          {friendsCount > 0 && (
            <Text as="span" size="xs" color="muted" weight="semibold" className="ml-auto">{friendsCount}</Text>
          )}
        </Button>

        <Button
          onClick={onShowAddFriend}
          className={styles.menuButton}
        >
          <UserPlus className="w-5 h-5 text-[#7f0df2]" />
          <Text as="span" size="sm" weight="semibold">Agregar amigo</Text>
        </Button>

        <Button
          onClick={onShowNotifications}
          className={styles.menuButtonRelative}
        >
          <Bell className="w-5 h-5 text-[#7f0df2]" />
          <Text as="span" size="sm" weight="semibold">Solicitudes recibidas</Text>
          {pendingRequestsCount > 0 && (
            <span className={styles.notificationBadge}>
              {pendingRequestsCount}
            </span>
          )}
        </Button>

        <Button
          onClick={onLogout}
          className={styles.menuButton}
        >
          <UserIcon className="w-5 h-5 text-red-400" />
          <Text as="span" size="sm" color="danger" weight="semibold">Cerrar sesión</Text>
        </Button>
      </div>
    </div>
  );
}
