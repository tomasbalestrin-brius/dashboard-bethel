-- ============================================
-- SCRIPT DE DIAGNÓSTICO COMPLETO
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Verificar usuários do auth.users
SELECT
  '1. Usuários Auth' as check_name,
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar profiles existentes
SELECT
  '2. Profiles' as check_name,
  id,
  full_name,
  current_organization_id,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 3. Verificar se há usuários sem profile
SELECT
  '3. Usuários SEM Profile' as check_name,
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. Verificar organizations existentes
SELECT
  '4. Organizations' as check_name,
  id,
  name,
  slug,
  status,
  created_at
FROM public.organizations
ORDER BY created_at DESC;

-- 5. Verificar profiles com current_organization_id inválido (org não existe)
SELECT
  '5. Profiles com Org Inválida' as check_name,
  p.id as profile_id,
  p.full_name,
  p.current_organization_id,
  o.id as org_exists
FROM public.profiles p
LEFT JOIN public.organizations o ON p.current_organization_id = o.id
WHERE p.current_organization_id IS NOT NULL
  AND o.id IS NULL;

-- 6. Verificar organization_members
SELECT
  '6. Organization Members' as check_name,
  om.id,
  om.user_id,
  om.organization_id,
  om.role,
  p.full_name,
  o.name as org_name
FROM public.organization_members om
LEFT JOIN public.profiles p ON om.user_id = p.id
LEFT JOIN public.organizations o ON om.organization_id = o.id
ORDER BY om.joined_at DESC;

-- 7. Verificar usuários com current_org mas SEM membership
SELECT
  '7. Users com Org mas SEM Membership' as check_name,
  p.id as profile_id,
  p.full_name,
  p.current_organization_id,
  om.id as membership_exists
FROM public.profiles p
LEFT JOIN public.organization_members om
  ON p.id = om.user_id
  AND p.current_organization_id = om.organization_id
WHERE p.current_organization_id IS NOT NULL
  AND om.id IS NULL;

-- 8. Verificar RLS policies na tabela profiles
SELECT
  '8. RLS Policies - Profiles' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 9. Verificar RLS policies na tabela organizations
SELECT
  '9. RLS Policies - Organizations' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

-- 10. Verificar RLS policies na tabela organization_members
SELECT
  '10. RLS Policies - Members' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;

-- 11. Verificar se RLS está habilitado nas tabelas
SELECT
  '11. RLS Status' as check_name,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'organizations', 'organization_members')
ORDER BY tablename;

-- 12. Verificar trigger de auto-criar profiles
SELECT
  '12. Trigger auto_create_profile' as check_name,
  tgname as trigger_name,
  tgtype,
  tgenabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname LIKE '%profile%' OR tgname LIKE '%user%';
