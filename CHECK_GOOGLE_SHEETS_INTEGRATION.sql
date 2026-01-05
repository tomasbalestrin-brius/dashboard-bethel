-- ============================================
-- VERIFICAR INTEGRAÇÃO GOOGLE SHEETS
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Verificar se tabela existe
SELECT
  '1. Tabela google_sheets_integrations' as info,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'google_sheets_integrations'
  ) as tabela_existe;

-- PASSO 2: Verificar estrutura da tabela (se existir)
SELECT
  '2. Estrutura da Tabela' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'google_sheets_integrations'
ORDER BY ordinal_position;

-- PASSO 3: Verificar RLS status
SELECT
  '3. Status RLS' as info,
  tablename,
  CASE
    WHEN rowsecurity THEN '⚠️ RLS HABILITADO'
    ELSE '✅ RLS DESABILITADO'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'google_sheets_integrations';

-- PASSO 4: Verificar policies existentes
SELECT
  '4. Policies Existentes' as info,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'google_sheets_integrations'
ORDER BY policyname;

-- PASSO 5: Verificar se há integrações criadas
SELECT
  '5. Integrações Existentes' as info,
  COUNT(*) as total_integracoes
FROM public.google_sheets_integrations;

-- PASSO 6: Desabilitar RLS se necessário
ALTER TABLE IF EXISTS public.google_sheets_integrations DISABLE ROW LEVEL SECURITY;

-- PASSO 7: Verificar tabela de histórico de sync
SELECT
  '7. Tabela Histórico Sync' as info,
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'google_sheets_sync_history'
  ) as tabela_existe;

-- PASSO 8: Desabilitar RLS na tabela de histórico
ALTER TABLE IF EXISTS public.google_sheets_sync_history DISABLE ROW LEVEL SECURITY;

-- PASSO 9: Status final
SELECT
  '9. ✅ STATUS FINAL' as info,
  tablename,
  CASE
    WHEN rowsecurity THEN '⚠️ RLS HABILITADO'
    ELSE '✅ RLS DESABILITADO'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('google_sheets_integrations', 'google_sheets_sync_history')
ORDER BY tablename;
