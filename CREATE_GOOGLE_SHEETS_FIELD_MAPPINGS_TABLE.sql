-- ============================================
-- CRIAR TABELA DE MAPEAMENTOS DE CAMPOS
-- Google Sheets Field Mappings
-- Execute no Supabase SQL Editor
-- ============================================

-- PASSO 1: Criar tabela de mapeamentos
CREATE TABLE IF NOT EXISTS public.google_sheets_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.google_sheets_integrations(id) ON DELETE CASCADE,

  -- Identificação do card/campo
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,

  -- Origem dos dados
  source_type TEXT NOT NULL CHECK (source_type IN ('cell', 'range', 'formula')),
  source_value TEXT NOT NULL, -- Ex: "B5", "D10:D50", "=(E10/E11)*100"

  -- Tipo de agregação
  aggregation TEXT NOT NULL CHECK (aggregation IN ('value', 'sum', 'average', 'count', 'last', 'formula')),

  -- Formato de exibição
  format TEXT NOT NULL CHECK (format IN ('number', 'currency', 'percentage', 'text', 'date')),

  -- Fórmula customizada (opcional)
  custom_formula TEXT,

  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PASSO 2: Criar índices
CREATE INDEX IF NOT EXISTS idx_field_mappings_integration_id
  ON public.google_sheets_field_mappings(integration_id);

CREATE INDEX IF NOT EXISTS idx_field_mappings_card_id
  ON public.google_sheets_field_mappings(card_id);

CREATE INDEX IF NOT EXISTS idx_field_mappings_integration_card
  ON public.google_sheets_field_mappings(integration_id, card_id);

-- PASSO 3: Trigger para updated_at
CREATE OR REPLACE FUNCTION update_field_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_field_mappings_updated_at
  BEFORE UPDATE ON public.google_sheets_field_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_field_mappings_updated_at();

-- PASSO 4: Desabilitar RLS (por enquanto)
ALTER TABLE public.google_sheets_field_mappings DISABLE ROW LEVEL SECURITY;

-- PASSO 5: Comentários na tabela
COMMENT ON TABLE public.google_sheets_field_mappings IS 'Mapeamentos granulares de campos/cards para integração Google Sheets';
COMMENT ON COLUMN public.google_sheets_field_mappings.source_type IS 'Tipo de origem: cell (célula única), range (intervalo), formula (fórmula customizada)';
COMMENT ON COLUMN public.google_sheets_field_mappings.aggregation IS 'Tipo de agregação: value, sum, average, count, last, formula';
COMMENT ON COLUMN public.google_sheets_field_mappings.format IS 'Formato de exibição: number, currency, percentage, text, date';

-- PASSO 6: Verificar estrutura
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'google_sheets_field_mappings'
ORDER BY ordinal_position;

-- ============================================
-- ✅ PRONTO!
-- Tabela criada com sucesso
-- ============================================
