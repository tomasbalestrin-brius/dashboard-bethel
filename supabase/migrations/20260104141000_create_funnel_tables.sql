-- =====================================================
-- FUNNEL MANAGEMENT SYSTEM
-- =====================================================
-- Migration para criar tabelas de gerenciamento de funis
-- Inclui: Funis de Aquisição, Funis SDR e Dados SDR

-- =====================================================
-- 1. TABELA: acquisition_funnels (Funis de Aquisição)
-- =====================================================
CREATE TABLE acquisition_funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Informações do funil
  name TEXT NOT NULL,
  description TEXT,

  -- Conexão com planilha (opcional, pode ser integração futura)
  connection_id UUID REFERENCES spreadsheet_connections(id) ON DELETE SET NULL,

  -- Dados de investimento e métricas
  monthly_investment DECIMAL(10, 2) DEFAULT 0,

  -- Configuração
  is_active BOOLEAN DEFAULT true,

  -- Auditoria
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraint: nome único por organização
  UNIQUE(organization_id, name)
);

-- Índices para acquisition_funnels
CREATE INDEX idx_acquisition_funnels_org ON acquisition_funnels(organization_id);
CREATE INDEX idx_acquisition_funnels_active ON acquisition_funnels(is_active) WHERE is_active = true;
CREATE INDEX idx_acquisition_funnels_connection ON acquisition_funnels(connection_id) WHERE connection_id IS NOT NULL;

-- =====================================================
-- 2. TABELA: acquisition_funnel_data (Dados mensais dos funis de aquisição)
-- =====================================================
CREATE TABLE acquisition_funnel_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES acquisition_funnels(id) ON DELETE CASCADE NOT NULL,

  -- Período
  month TEXT NOT NULL, -- 'jan', 'fev', 'mar', etc
  year INTEGER NOT NULL,

  -- Métricas do funil
  total_leads INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  scheduled INTEGER DEFAULT 0,
  calls_done INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,

  -- Investimento
  investment DECIMAL(10, 2) DEFAULT 0,

  -- Métricas calculadas (pode ser computado no frontend, mas armazenamos para cache)
  cost_per_lead DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE
      WHEN total_leads > 0 THEN investment / total_leads
      ELSE 0
    END
  ) STORED,

  conversion_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN qualified_leads > 0 THEN (sales::DECIMAL / qualified_leads::DECIMAL) * 100
      ELSE 0
    END
  ) STORED,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraint: um registro por mês/ano por funil
  UNIQUE(funnel_id, month, year)
);

-- Índices para acquisition_funnel_data
CREATE INDEX idx_acquisition_data_funnel ON acquisition_funnel_data(funnel_id);
CREATE INDEX idx_acquisition_data_period ON acquisition_funnel_data(year, month);

-- =====================================================
-- 3. TABELA: sdr_funnels (Funis SDR)
-- =====================================================
CREATE TABLE sdr_funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Informações do funil
  name TEXT NOT NULL,
  description TEXT,

  -- Proprietário do funil (quem gerencia este funil)
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Configuração
  is_active BOOLEAN DEFAULT true,

  -- Auditoria
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraint: nome único por organização
  UNIQUE(organization_id, name)
);

-- Índices para sdr_funnels
CREATE INDEX idx_sdr_funnels_org ON sdr_funnels(organization_id);
CREATE INDEX idx_sdr_funnels_owner ON sdr_funnels(owner_id);
CREATE INDEX idx_sdr_funnels_active ON sdr_funnels(is_active) WHERE is_active = true;

-- =====================================================
-- 4. TABELA: sdr_data (Dados mensais dos funis SDR)
-- =====================================================
CREATE TABLE sdr_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES sdr_funnels(id) ON DELETE CASCADE NOT NULL,

  -- Período
  month TEXT NOT NULL, -- 'jan', 'fev', 'mar', etc
  year INTEGER NOT NULL,

  -- ===== LEADS POR CLASSIFICAÇÃO =====
  leads_diamante INTEGER DEFAULT 0,
  leads_ouro INTEGER DEFAULT 0,
  leads_prata INTEGER DEFAULT 0,
  leads_bronze INTEGER DEFAULT 0,

  -- ===== AGENDAMENTOS POR CLASSIFICAÇÃO =====
  agendamentos_diamante INTEGER DEFAULT 0,
  agendamentos_ouro INTEGER DEFAULT 0,
  agendamentos_prata INTEGER DEFAULT 0,
  agendamentos_bronze INTEGER DEFAULT 0,

  -- ===== CALLS REALIZADAS POR CLASSIFICAÇÃO =====
  calls_diamante INTEGER DEFAULT 0,
  calls_ouro INTEGER DEFAULT 0,
  calls_prata INTEGER DEFAULT 0,
  calls_bronze INTEGER DEFAULT 0,

  -- ===== VENDAS POR CLASSIFICAÇÃO =====
  vendas_diamante INTEGER DEFAULT 0,
  vendas_ouro INTEGER DEFAULT 0,
  vendas_prata INTEGER DEFAULT 0,
  vendas_bronze INTEGER DEFAULT 0,

  -- ===== TOTAIS (COMPUTED COLUMNS) =====
  total_leads INTEGER GENERATED ALWAYS AS (
    leads_diamante + leads_ouro + leads_prata + leads_bronze
  ) STORED,

  total_agendamentos INTEGER GENERATED ALWAYS AS (
    agendamentos_diamante + agendamentos_ouro + agendamentos_prata + agendamentos_bronze
  ) STORED,

  total_calls INTEGER GENERATED ALWAYS AS (
    calls_diamante + calls_ouro + calls_prata + calls_bronze
  ) STORED,

  total_vendas INTEGER GENERATED ALWAYS AS (
    vendas_diamante + vendas_ouro + vendas_prata + vendas_bronze
  ) STORED,

  -- ===== TAXAS GERAIS (COMPUTED COLUMNS) =====
  taxa_agendamento_geral DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN (leads_diamante + leads_ouro + leads_prata + leads_bronze) > 0
      THEN ((agendamentos_diamante + agendamentos_ouro + agendamentos_prata + agendamentos_bronze)::DECIMAL /
            (leads_diamante + leads_ouro + leads_prata + leads_bronze)::DECIMAL) * 100
      ELSE 0
    END
  ) STORED,

  taxa_comparecimento_geral DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN (agendamentos_diamante + agendamentos_ouro + agendamentos_prata + agendamentos_bronze) > 0
      THEN ((calls_diamante + calls_ouro + calls_prata + calls_bronze)::DECIMAL /
            (agendamentos_diamante + agendamentos_ouro + agendamentos_prata + agendamentos_bronze)::DECIMAL) * 100
      ELSE 0
    END
  ) STORED,

  taxa_conversao_geral DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN (calls_diamante + calls_ouro + calls_prata + calls_bronze) > 0
      THEN ((vendas_diamante + vendas_ouro + vendas_prata + vendas_bronze)::DECIMAL /
            (calls_diamante + calls_ouro + calls_prata + calls_bronze)::DECIMAL) * 100
      ELSE 0
    END
  ) STORED,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Constraint: um registro por mês/ano por funil
  UNIQUE(funnel_id, month, year)
);

-- Índices para sdr_data
CREATE INDEX idx_sdr_data_funnel ON sdr_data(funnel_id);
CREATE INDEX idx_sdr_data_period ON sdr_data(year, month);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE TRIGGER acquisition_funnels_updated_at
  BEFORE UPDATE ON acquisition_funnels
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER acquisition_funnel_data_updated_at
  BEFORE UPDATE ON acquisition_funnel_data
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER sdr_funnels_updated_at
  BEFORE UPDATE ON sdr_funnels
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER sdr_data_updated_at
  BEFORE UPDATE ON sdr_data
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- ===== ACQUISITION_FUNNELS =====
ALTER TABLE acquisition_funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org acquisition funnels"
  ON acquisition_funnels FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage acquisition funnels"
  ON acquisition_funnels FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ===== ACQUISITION_FUNNEL_DATA =====
ALTER TABLE acquisition_funnel_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org acquisition data"
  ON acquisition_funnel_data FOR SELECT
  USING (
    funnel_id IN (
      SELECT id FROM acquisition_funnels
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage acquisition data"
  ON acquisition_funnel_data FOR ALL
  USING (
    funnel_id IN (
      SELECT id FROM acquisition_funnels
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- ===== SDR_FUNNELS =====
ALTER TABLE sdr_funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org sdr funnels"
  ON sdr_funnels FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and SDRs can manage their funnels"
  ON sdr_funnels FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND (role IN ('owner', 'admin', 'gestor') OR (role = 'sdr' AND owner_id = auth.uid()))
    )
  );

-- ===== SDR_DATA =====
ALTER TABLE sdr_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org sdr data"
  ON sdr_data FOR SELECT
  USING (
    funnel_id IN (
      SELECT id FROM sdr_funnels
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authorized users can manage sdr data"
  ON sdr_data FOR ALL
  USING (
    funnel_id IN (
      SELECT sf.id FROM sdr_funnels sf
      JOIN organization_members om ON om.organization_id = sf.organization_id
      WHERE om.user_id = auth.uid()
        AND (om.role IN ('owner', 'admin', 'gestor') OR (om.role = 'sdr' AND sf.owner_id = auth.uid()))
    )
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function: Calcular custo por lead de um funil de aquisição
CREATE OR REPLACE FUNCTION public.calculate_acquisition_cost_per_lead(
  _funnel_id uuid,
  _month text,
  _year integer
)
RETURNS DECIMAL(10, 2)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN total_leads > 0 THEN investment / total_leads
      ELSE 0
    END as cost_per_lead
  FROM acquisition_funnel_data
  WHERE funnel_id = _funnel_id
    AND month = _month
    AND year = _year
$$;

-- Function: Calcular taxa de agendamento SDR por classificação
CREATE OR REPLACE FUNCTION public.calculate_sdr_scheduling_rate(
  _funnel_id uuid,
  _month text,
  _year integer,
  _classification text -- 'diamante', 'ouro', 'prata', 'bronze', ou 'geral'
)
RETURNS DECIMAL(5, 2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  leads_count INTEGER;
  agendamentos_count INTEGER;
BEGIN
  IF _classification = 'geral' THEN
    SELECT total_leads, total_agendamentos
    INTO leads_count, agendamentos_count
    FROM sdr_data
    WHERE funnel_id = _funnel_id AND month = _month AND year = _year;
  ELSE
    EXECUTE format(
      'SELECT leads_%s, agendamentos_%s FROM sdr_data WHERE funnel_id = $1 AND month = $2 AND year = $3',
      _classification, _classification
    ) INTO leads_count, agendamentos_count
    USING _funnel_id, _month, _year;
  END IF;

  IF leads_count > 0 THEN
    RETURN (agendamentos_count::DECIMAL / leads_count::DECIMAL) * 100;
  ELSE
    RETURN 0;
  END IF;
END;
$$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE acquisition_funnels IS 'Funis de aquisição de leads com métricas de marketing';
COMMENT ON TABLE acquisition_funnel_data IS 'Dados mensais dos funis de aquisição';
COMMENT ON TABLE sdr_funnels IS 'Funis de SDR para gestão de leads qualificados';
COMMENT ON TABLE sdr_data IS 'Dados mensais dos funis SDR com classificação de leads';

COMMENT ON FUNCTION calculate_acquisition_cost_per_lead IS 'Calcula o custo por lead de um funil de aquisição em um período específico';
COMMENT ON FUNCTION calculate_sdr_scheduling_rate IS 'Calcula a taxa de agendamento de um funil SDR por classificação';
