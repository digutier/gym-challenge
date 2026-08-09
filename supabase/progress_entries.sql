-- =============================================
-- Gym Challenge - Progress Photos Migration
-- Ejecutar en Supabase SQL Editor
-- =============================================
-- Tabla privada de fotos de progreso corporal (torso espalda, torso frente,
-- brazos, piernas) + nota + peso. A diferencia de gym_entries, esta data
-- NUNCA se comparte con amigos ni con vistas públicas — solo el dueño del
-- registro puede verla. Las columnas *_photo_path guardan el path dentro
-- del bucket privado, no una URL pública: las URLs se firman al vuelo
-- (createSignedUrl) en cada request desde el backend.

CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  back_photo_path TEXT,
  front_photo_path TEXT,
  arms_photo_path TEXT,
  legs_photo_path TEXT,
  note TEXT CHECK (char_length(note) <= 300),
  weight_kg NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un registro por día por usuario (mismo modelo que gym_entries)
  UNIQUE(user_id, date)
);

CREATE INDEX idx_progress_entries_user_date ON progress_entries(user_id, date DESC);

-- updated_at trigger (self-contained — no hay función de trigger compartida
-- trackeada en este repo, así que se define una propia para esta tabla)
CREATE OR REPLACE FUNCTION set_progress_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_progress_entries_updated_at
  BEFORE UPDATE ON progress_entries
  FOR EACH ROW EXECUTE FUNCTION set_progress_entries_updated_at();

-- =============================================
-- INSTRUCCIONES ADICIONALES (hacer manualmente)
-- =============================================

-- 1. Crear bucket de Storage:
--    a. Ve a Storage en Supabase Dashboard
--    b. Click "New bucket"
--    c. Nombre: progress-photos
--    d. NO marcar como "Public bucket" — debe quedar privado.
--    e. Click "Create bucket"
--
--    Este bucket es privado a propósito: las fotos de progreso son
--    personales y no deben ser accesibles vía URL directa sin firmar,
--    a diferencia de gym-photos (público, pensado para compartir).
