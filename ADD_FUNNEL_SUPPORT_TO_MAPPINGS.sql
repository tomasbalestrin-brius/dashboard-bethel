-- ============================================
-- ADICIONAR SUPORTE A MÚLTIPLOS FUNIS
-- Permite um mapeamento diferente para cada funil
-- Execute no Supabase SQL Editor
-- ============================================

-- PASSO 1: Adicionar coluna funnel_id e funnel_name na tabela de mapeamentos
ALTER TABLE public.google_sheets_field_mappings
ADD COLUMN IF NOT EXISTS funnel_id TEXT;

ALTER TABLE public.google_sheets_field_mappings
ADD COLUMN IF NOT EXISTS funnel_name TEXT;

-- PASSO 2: Remover a constraint UNIQUE antiga (se existir)
-- Isso permite múltiplas integrações por módulo (uma por funil)
DO $$
BEGIN
  -- Verificar e remover constraint se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'google_sheets_integrations_organization_id_module_name_spre_key'
  ) THEN
    ALTER TABLE public.google_sheets_integrations
    DROP CONSTRAINT google_sheets_integrations_organization_id_module_name_spre_key;
    RAISE NOTICE 'Constraint antiga removida com sucesso';
  END IF;
END $$;

-- PASSO 3: Criar índice composto único (organização + módulo permite múltiplas)
-- Agora podemos ter múltiplas integrações do mesmo módulo
-- A unicidade será garantida por (integration_id + card_id + funnel_id) nos mapeamentos
CREATE INDEX IF NOT EXISTS idx_integrations_org_module
  ON public.google_sheets_integrations(organization_id, module_name);

-- PASSO 4: Garantir unicidade de mapeamento por (integration_id, card_id, funnel_id)
-- Cada funil pode ter apenas um mapeamento por card
CREATE UNIQUE INDEX IF NOT EXISTS idx_field_mappings_unique_per_funnel
  ON public.google_sheets_field_mappings(integration_id, card_id, funnel_id)
  WHERE funnel_id IS NOT NULL;

-- PASSO 5: Índice para buscar mapeamentos por funil
CREATE INDEX IF NOT EXISTS idx_field_mappings_funnel_id
  ON public.google_sheets_field_mappings(funnel_id)
  WHERE funnel_id IS NOT NULL;

-- PASSO 6: Comentários
COMMENT ON COLUMN public.google_sheets_field_mappings.funnel_id IS 'ID do funil (opcional). Permite mapeamentos diferentes por funil.';
COMMENT ON COLUMN public.google_sheets_field_mappings.funnel_name IS 'Nome do funil para referência';

-- PASSO 7: Verificar estrutura
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'google_sheets_field_mappings'
  AND column_name IN ('funnel_id', 'funnel_name')
ORDER BY column_name;

-- PASSO 8: Verificar constraints
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.google_sheets_integrations'::regclass;

-- ============================================
-- ✅ PRONTO!
-- Agora você pode:
-- 1. Ter UMA integração por módulo
-- 2. Múltiplos mapeamentos por funil
-- 3. Cada funil com suas próprias células
-- ============================================
