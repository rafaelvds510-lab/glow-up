-- ============================================================
-- SANTUÁRIO DO GLOW-UP — Setup do Banco de Dados Supabase
-- Execute este SQL no Supabase > SQL Editor
-- ============================================================

-- 1. Tabela principal de sincronização de dados do usuário
CREATE TABLE IF NOT EXISTS public.user_sync_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  identidade JSONB DEFAULT '{}'::jsonb,
  habitos    JSONB DEFAULT '{}'::jsonb,
  vicios     JSONB DEFAULT '{}'::jsonb,
  leituras   JSONB DEFAULT '{}'::jsonb,
  frases     JSONB DEFAULT '{}'::jsonb,
  biblioteca JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.user_sync_data;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_sync_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Habilitar Row Level Security (RLS) — cada usuário só vê seus dados
ALTER TABLE public.user_sync_data ENABLE ROW LEVEL SECURITY;

-- 4. Política: usuário só acessa seu próprio registro
DROP POLICY IF EXISTS "Users can manage their own data" ON public.user_sync_data;
CREATE POLICY "Users can manage their own data"
  ON public.user_sync_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Tabela de hábitos direta (backup / alternativa)
CREATE TABLE IF NOT EXISTS public.habits_data (
  email   TEXT PRIMARY KEY,
  groups  JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.habits_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users access own habits" ON public.habits_data;
CREATE POLICY "Users access own habits"
  ON public.habits_data
  FOR ALL
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- Verificação
SELECT 'Tabelas criadas com sucesso!' AS status;
