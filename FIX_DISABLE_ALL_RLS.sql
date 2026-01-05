-- ============================================
-- VERIFICAR E CORRIGIR RLS EM TODAS AS TABELAS
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Verificar quais tabelas têm RLS habilitado
SELECT
  '1. Tabelas com RLS Habilitado' as info,
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity THEN '⚠️ RLS HABILITADO'
    ELSE '✅ RLS DESABILITADO'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%data%' OR tablename LIKE '%monetization%' OR tablename LIKE '%sdr%' OR tablename LIKE '%acquisition%'
ORDER BY tablename;

-- PASSO 2: Ver todas as policies que existem
SELECT
  '2. Todas as Policies Existentes' as info,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- PASSO 3: Desabilitar RLS em TODAS as tabelas de dados
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'monetization_data',
        'sdr_data',
        'acquisition_data',
        'sdr_funnels',
        'acquisition_funnels',
        'invitations',
        'google_sheets_integrations'
      )
  LOOP
    EXECUTE 'ALTER TABLE public.' || tbl.tablename || ' DISABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS desabilitado em: %', tbl.tablename;
  END LOOP;
END $$;

-- PASSO 4: Remover todas as policies de todas as tabelas
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || pol.schemaname || '.' || pol.tablename;
    RAISE NOTICE 'Policy removida: % em %', pol.policyname, pol.tablename;
  END LOOP;
END $$;

-- PASSO 5: Verificar status final
SELECT
  '✅ Status Final - RLS' as info,
  tablename,
  CASE
    WHEN rowsecurity THEN '⚠️ AINDA HABILITADO'
    ELSE '✅ DESABILITADO'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND (
    tablename LIKE '%data%' OR
    tablename LIKE '%monetization%' OR
    tablename LIKE '%sdr%' OR
    tablename LIKE '%acquisition%' OR
    tablename IN ('organizations', 'organization_members', 'profiles', 'invitations')
  )
ORDER BY tablename;

-- PASSO 6: Verificar que não há mais policies
SELECT
  '✅ Policies Restantes (deve estar vazio)' as info,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- PASSO 7: Testar query na tabela monetization_data
SELECT
  '✅ TESTE - monetization_data' as info,
  COUNT(*) as total_rows
FROM public.monetization_data;
