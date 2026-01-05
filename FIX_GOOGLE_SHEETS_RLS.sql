-- ============================================
-- CORRIGIR INTEGRAÇÃO GOOGLE SHEETS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- PASSO 1: Verificar se as tabelas existem
SELECT
  '1. Verificando tabelas' as passo,
  tablename,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tablename
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM (
  VALUES
    ('google_sheets_integrations'),
    ('google_sheets_sync_history')
) AS t(tablename);

-- PASSO 2: Desabilitar RLS em ambas as tabelas
ALTER TABLE IF EXISTS public.google_sheets_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_sheets_sync_history DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Remover todas as policies existentes (se houver)
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Remove policies de google_sheets_integrations
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'google_sheets_integrations' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.google_sheets_integrations';
    RAISE NOTICE 'Policy removida: %', pol.policyname;
  END LOOP;

  -- Remove policies de google_sheets_sync_history
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'google_sheets_sync_history' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.google_sheets_sync_history';
    RAISE NOTICE 'Policy removida: %', pol.policyname;
  END LOOP;
END $$;

-- PASSO 4: Verificar status final
SELECT
  '4. ✅ STATUS FINAL' as passo,
  tablename,
  CASE
    WHEN rowsecurity THEN '⚠️ RLS AINDA HABILITADO'
    ELSE '✅ RLS DESABILITADO'
  END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policies_count
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('google_sheets_integrations', 'google_sheets_sync_history')
ORDER BY tablename;

-- PASSO 5: Verificar se há integrações existentes
SELECT
  '5. Integrações Existentes' as passo,
  COALESCE(COUNT(*), 0) as total
FROM public.google_sheets_integrations
WHERE is_active = true;

-- ============================================
-- ✅ PRONTO!
-- Agora tente criar a integração novamente
-- ============================================
