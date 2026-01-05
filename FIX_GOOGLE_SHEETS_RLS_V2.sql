-- ============================================
-- CORRIGIR INTEGRAÇÃO GOOGLE SHEETS - V2
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- PASSO 1: Desabilitar RLS nas tabelas
ALTER TABLE IF EXISTS public.google_sheets_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_sheets_sync_history DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover policies de google_sheets_integrations
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'google_sheets_integrations' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.google_sheets_integrations';
    RAISE NOTICE 'Policy removida de google_sheets_integrations: %', pol.policyname;
  END LOOP;
END $$;

-- PASSO 3: Remover policies de google_sheets_sync_history
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'google_sheets_sync_history' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.google_sheets_sync_history';
    RAISE NOTICE 'Policy removida de google_sheets_sync_history: %', pol.policyname;
  END LOOP;
END $$;

-- PASSO 4: Verificar resultado final
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '⚠️ RLS AINDA HABILITADO'
    ELSE '✅ RLS DESABILITADO'
  END as status,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename AND schemaname = 'public') as policies_restantes
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('google_sheets_integrations', 'google_sheets_sync_history')
ORDER BY tablename;

-- ============================================
-- ✅ PRONTO!
-- Você deve ver:
-- - google_sheets_integrations | ✅ RLS DESABILITADO | 0
-- - google_sheets_sync_history | ✅ RLS DESABILITADO | 0
-- ============================================
