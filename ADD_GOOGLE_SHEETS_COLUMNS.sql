-- ============================================
-- ADICIONAR COLUNAS PARA GOOGLE SHEETS SIMPLIFICADO
-- Execute no Supabase SQL Editor
-- ============================================

-- PASSO 1: Adicionar coluna sync_direction
ALTER TABLE public.google_sheets_integrations
ADD COLUMN IF NOT EXISTS sync_direction TEXT DEFAULT 'export'
CHECK (sync_direction IN ('export', 'import', 'both'));

-- PASSO 2: Adicionar coluna data_range
ALTER TABLE public.google_sheets_integrations
ADD COLUMN IF NOT EXISTS data_range TEXT;

-- PASSO 3: Adicionar coluna has_header
ALTER TABLE public.google_sheets_integrations
ADD COLUMN IF NOT EXISTS has_header BOOLEAN DEFAULT true;

-- PASSO 4: Adicionar comentários nas colunas
COMMENT ON COLUMN public.google_sheets_integrations.sync_direction IS 'Direção da sincronização: export (sistema -> sheets), import (sheets -> sistema), ou both (ambos)';
COMMENT ON COLUMN public.google_sheets_integrations.data_range IS 'Intervalo de células (ex: A1:Z1000). NULL = aba inteira';
COMMENT ON COLUMN public.google_sheets_integrations.has_header IS 'Se true, a primeira linha da planilha contém cabeçalhos';

-- PASSO 5: Atualizar integrações existentes (se houver)
UPDATE public.google_sheets_integrations
SET
  sync_direction = 'export',
  has_header = true
WHERE sync_direction IS NULL;

-- PASSO 6: Verificar estrutura final
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'google_sheets_integrations'
  AND column_name IN ('sync_direction', 'data_range', 'has_header')
ORDER BY column_name;

-- ============================================
-- ✅ PRONTO!
-- As colunas foram adicionadas com sucesso
-- ============================================
