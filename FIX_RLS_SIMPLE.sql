-- ============================================
-- SOLUÇÃO SIMPLES: Fix RLS no profiles
-- ============================================
-- Copie e cole TUDO no Supabase SQL Editor

-- Passo 1: Garantir que RLS está ativo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Passo 2: Remover policies antigas que podem estar conflitando
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to read their own data" ON profiles;

-- Passo 3: Criar policy de SELECT CORRETA
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Passo 4: Garantir que policy de UPDATE existe
-- Se der erro "já existe", ignore - é normal!
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Passo 5: Garantir permissões
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Passo 6: Verificar se funcionou
SELECT 'SUCCESS: RLS configurado corretamente!' as message;

-- Passo 7: Ver as policies criadas
SELECT
  policyname as "Policy",
  cmd as "Command",
  roles as "Roles"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
