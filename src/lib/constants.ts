// Configuración de usuarios del desafío
// Los tokens son únicos por usuario para identificación simple

export const USERS = [
  {
    name: 'Guryx',
    avatar: '🧑',
    token: 'token-android-guryx',
  },
  {
    name: 'Cuyi',
    avatar: '👨',
    token: 'token-ios-cuyi',
  },
  {
    name: 'Karin',
    avatar: '👩',
    token: 'token-ios-karin',
  },
  {
    name: 'Pablo',
    avatar: '🧔',
    token: 'token-ios-pablo',
  },
] as const;

export type UserToken = typeof USERS[number]['token'];

// Nombre del bucket de Supabase Storage
export const STORAGE_BUCKET = 'gym-photos';

// Clave para localStorage
export const TOKEN_STORAGE_KEY = 'gym-challenge-token';

