-- ============================================
-- DESABILITAR RLS - Versão Corrigida
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Remover TODAS as policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  RAISE NOTICE 'Removendo todas as policies...';

  -- Remover policies de organizations
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'organizations'
      AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.organizations';
    RAISE NOTICE 'Removida: %', pol.policyname;
  END LOOP;

  -- Remover policies de organization_members
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'organization_members'
      AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.organization_members';
    RAISE NOTICE 'Removida: %', pol.policyname;
  END LOOP;

  RAISE NOTICE 'Todas policies removidas!';
END $$;

-- PASSO 2: DESABILITAR RLS
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Verificar status
SELECT
  '✅ Status Final' as info,
  tablename,
  CASE
    WHEN rowsecurity THEN '❌ RLS HABILITADO'
    ELSE '✅ RLS DESABILITADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'organization_members')
ORDER BY tablename;

-- PASSO 4: Testar queries
SELECT
  '✅ TESTE Organizations' as info,
  COUNT(*) as total_orgs
FROM public.organizations;

SELECT
  '✅ TESTE Members' as info,
  COUNT(*) as total_members
FROM public.organization_members;

-- PASSO 5: Verificar sua organização
SELECT
  '✅ Sua Organização' as info,
  id,
  name,
  slug,
  status
FROM public.organizations
ORDER BY created_at DESC
LIMIT 5;
