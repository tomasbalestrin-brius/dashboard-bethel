-- =====================================================
-- MIGRATION: Daily Data Tables for SDR and Monetization
-- =====================================================

-- Drop existing sdr_data table if exists
DROP TABLE IF EXISTS sdr_data CASCADE;

-- Create SDR data table (daily entries)
CREATE TABLE sdr_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  funnel_id UUID NOT NULL REFERENCES sdr_funnels(id) ON DELETE CASCADE,
  data_date DATE NOT NULL, -- Data do registro

  -- Leads totais que entraram
  leads_total INTEGER DEFAULT 0 CHECK (leads_total >= 0),

  -- Pessoas que responderam formulário
  responderam_formulario INTEGER DEFAULT 0 CHECK (responderam_formulario >= 0),

  -- MQL por classificação
  mql_diamante INTEGER DEFAULT 0 CHECK (mql_diamante >= 0),
  mql_ouro INTEGER DEFAULT 0 CHECK (mql_ouro >= 0),
  mql_prata INTEGER DEFAULT 0 CHECK (mql_prata >= 0),
  mql_bronze INTEGER DEFAULT 0 CHECK (mql_bronze >= 0),

  -- Agendamentos por classificação
  agendamentos_diamante INTEGER DEFAULT 0 CHECK (agendamentos_diamante >= 0),
  agendamentos_ouro INTEGER DEFAULT 0 CHECK (agendamentos_ouro >= 0),
  agendamentos_prata INTEGER DEFAULT 0 CHECK (agendamentos_prata >= 0),
  agendamentos_bronze INTEGER DEFAULT 0 CHECK (agendamentos_bronze >= 0),

  -- Calls realizadas por classificação
  calls_diamante INTEGER DEFAULT 0 CHECK (calls_diamante >= 0),
  calls_ouro INTEGER DEFAULT 0 CHECK (calls_ouro >= 0),
  calls_prata INTEGER DEFAULT 0 CHECK (calls_prata >= 0),
  calls_bronze INTEGER DEFAULT 0 CHECK (calls_bronze >= 0),

  -- Vendas por classificação
  vendas_diamante INTEGER DEFAULT 0 CHECK (vendas_diamante >= 0),
  vendas_ouro INTEGER DEFAULT 0 CHECK (vendas_ouro >= 0),
  vendas_prata INTEGER DEFAULT 0 CHECK (vendas_prata >= 0),
  vendas_bronze INTEGER DEFAULT 0 CHECK (vendas_bronze >= 0),

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, funnel_id, data_date)
);

-- Create Monetization data table (daily entries)
CREATE TABLE monetization_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_date DATE NOT NULL,

  -- Dados financeiros do dia
  faturamento DECIMAL(15, 2) DEFAULT 0 CHECK (faturamento >= 0),
  entrada DECIMAL(15, 2) DEFAULT 0 CHECK (entrada >= 0),

  -- Dados de alunos qualificados (para calcular receita por aluno)
  alunos_qualificados INTEGER DEFAULT 0 CHECK (alunos_qualificados >= 0),

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, data_date)
);

-- Índices para performance
CREATE INDEX idx_sdr_data_org_date ON sdr_data(organization_id, data_date DESC);
CREATE INDEX idx_sdr_data_funnel_date ON sdr_data(funnel_id, data_date DESC);
CREATE INDEX idx_sdr_data_org_funnel ON sdr_data(organization_id, funnel_id);
CREATE INDEX idx_monetization_data_org_date ON monetization_data(organization_id, data_date DESC);

-- Enable RLS
ALTER TABLE sdr_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE monetization_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sdr_data
CREATE POLICY "Users can view sdr_data from their organization"
  ON sdr_data FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sdr_data in their organization"
  ON sdr_data FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'sdr', 'gestor')
    )
  );

CREATE POLICY "Users can update sdr_data in their organization"
  ON sdr_data FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'sdr', 'gestor')
    )
  );

CREATE POLICY "Users can delete sdr_data in their organization"
  ON sdr_data FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'gestor')
    )
  );

-- RLS Policies for monetization_data
CREATE POLICY "Users can view monetization_data from their organization"
  ON monetization_data FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert monetization_data in their organization"
  ON monetization_data FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'comercial', 'gestor')
    )
  );

CREATE POLICY "Users can update monetization_data in their organization"
  ON monetization_data FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'comercial', 'gestor')
    )
  );

CREATE POLICY "Users can delete monetization_data in their organization"
  ON monetization_data FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'gestor')
    )
  );

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_sdr_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sdr_data_updated_at
  BEFORE UPDATE ON sdr_data
  FOR EACH ROW
  EXECUTE FUNCTION update_sdr_data_updated_at();

CREATE OR REPLACE FUNCTION update_monetization_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_monetization_data_updated_at
  BEFORE UPDATE ON monetization_data
  FOR EACH ROW
  EXECUTE FUNCTION update_monetization_data_updated_at();

-- Comments
COMMENT ON TABLE sdr_data IS 'Daily SDR data entries with MQL classifications and conversion metrics';
COMMENT ON TABLE monetization_data IS 'Daily monetization data with revenue and qualified students metrics';

-- =====================================================
-- Migration completed successfully!
-- =====================================================
