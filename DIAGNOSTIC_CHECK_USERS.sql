-- ============================================
-- DIAGNÓSTICO: Verificar usuários e constraints
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Verificar usuários em auth.users
SELECT
  '1. Usuários em auth.users' as check_type,
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar se existe tabela public.users
SELECT
  '2. Tabela public.users existe?' as check_type,
  COUNT(*) as total_rows
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'users';

-- 3. Verificar constraints da tabela organization_members
SELECT
  '3. Foreign Keys de organization_members' as check_type,
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table,
  a.attname as column_name,
  af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
WHERE conrelid = 'public.organization_members'::regclass
  AND contype = 'f';

-- 4. Verificar se o usuário 141e40b1 existe em auth.users
SELECT
  '4. Usuário 141e40b1 em auth.users?' as check_type,
  id,
  email,
  created_at
FROM auth.users
WHERE id = '141e40b1-ab8d-4a65-b85e-c634df8a73b0';

-- 5. Verificar profiles existentes
SELECT
  '5. Profiles existentes' as check_type,
  id,
  full_name,
  current_organization_id,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
