-- =============================================
-- Gym Challenge - Database Schema
-- =============================================
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de registros de gym
CREATE TABLE IF NOT EXISTS gym_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un registro por día por usuario
  UNIQUE(user_id, date)
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_gym_entries_user_id ON gym_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_entries_date ON gym_entries(date);
CREATE INDEX IF NOT EXISTS idx_gym_entries_user_date ON gym_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);

-- 4. Insertar usuarios iniciales
-- ⚠️ Modifica los nombres según tus amigos
INSERT INTO users (name, avatar, token) VALUES
  ('Guryx', '🧑', 'token-android-guryx'),
  ('Cuyi', '👨', 'token-ios-cuyi'),
  ('Karin', '👩', 'token-ios-karin'),
  ('Pablo', '🧔', 'token-ios-pablo')
ON CONFLICT (token) DO NOTHING;

-- =============================================
-- INSTRUCCIONES ADICIONALES (hacer manualmente)
-- =============================================

-- 5. Crear bucket de Storage:
--    a. Ve a Storage en Supabase Dashboard
--    b. Click "New bucket"
--    c. Nombre: gym-photos
--    d. Marcar como "Public bucket"
--    e. Click "Create bucket"

-- 6. Configurar políticas de Storage (opcional para bucket público):
--    El bucket público permite lectura sin autenticación.
--    Para escritura, usamos service_role en el backend.

-- 7. Verificar que todo funcione:
--    SELECT * FROM users;
--    -- Deberías ver los 4 usuarios insertados

