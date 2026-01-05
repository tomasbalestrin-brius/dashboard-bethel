-- ============================================
-- DIAGNÓSTICO: RLS Policies da tabela profiles
-- ============================================
-- Copie e cole no Supabase SQL Editor para diagnosticar o problema

-- 1. Verificar se RLS está habilitado
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- 2. Listar todas as policies existentes
SELECT
  schemaname,
  tablename,
  policyname as "Policy Name",
  permissive as "Permissive",
  roles as "Roles",
  cmd as "Command",
  qual as "USING Expression",
  with_check as "WITH CHECK Expression"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Verificar grants da tabela
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- ============================================
-- SOLUÇÃO: Se faltam policies, execute isso:
-- ============================================

-- Apenas execute se a policy de SELECT não existir
-- (verifique na query 2 acima)

-- DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
-- CREATE POLICY "Users can read own profile"
--   ON profiles
--   FOR SELECT
--   USING (auth.uid() = id);

-- DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
-- CREATE POLICY "Enable read access for authenticated users"
--   ON profiles
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = id);

-- GRANT SELECT, UPDATE ON profiles TO authenticated;
-- GRANT ALL ON profiles TO service_role;
