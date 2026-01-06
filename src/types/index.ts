// Tipos principales para Gym Challenge

export interface User {
  id: string;
  name: string;
  avatar: string;
  token: string;
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
}

export interface CheckTodayResponse {
  alreadyRegistered: boolean;
  entry?: {
    date: string;
    photo_url: string;
    timestamp: string;
  };
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

export type AppState = 
  | 'loading'
  | 'login'
  | 'not-registered'
  | 'registered'
  | 'uploading';
