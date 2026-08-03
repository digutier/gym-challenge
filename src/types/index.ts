// Tipos principales para Gym Challenge

export interface User {
  id: string;
  name: string;
  avatar: string;
  created_at?: string;
}

export interface GymEntry {
  id: string;
  user_id: string;
  date: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export interface WeekEntry {
  date: string;
  registered: boolean;
  photo_url?: string;
}

export interface UserStats {
  id: string;
  name: string;
  avatar: string;
  daysThisWeek: number;
  totalDays: number;
  monthlyDays?: number; // Total mensual con cap semanal aplicado
  todayPhotoUrl?: string; // URL de la foto de hoy (si existe)
  todayPhotoTimestamp?: string; // Timestamp de la foto de hoy (si existe)
}

export interface EntryData {
  date: string;
  photo_url: string;
  timestamp: string;
}

export interface CheckTodayResponse {
  alreadyRegistered: boolean;
  entry?: EntryData;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface UploadResponse {
  success: boolean;
  entry: GymEntry;
  daysThisWeek: number;
}

export interface UserStatsResponse {
  daysThisWeek: number;
  weekEntries: WeekEntry[];
  totalDays: number;
}

export interface AllStatsResponse {
  users: UserStats[];
}

export interface FriendRequest {
  id: string;
  requester: { id: string; name: string; avatar: string; email: string };
  created_at: string;
}

export interface Friend {
  friendshipId: string;
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface DayUser {
  id: string;
  name: string;
  avatar: string;
  photoUrl: string | null;
  photoTimestamp: string | null;
  hasPhoto: boolean;
}

export interface UserSearchResult {
  user_id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface ProfileRow {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export type AcceptedProfileRow = ProfileRow | ProfileRow[] | null;
