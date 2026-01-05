-- =====================================================
-- DASHBOARD BETHEL - APLICAR TODAS AS MIGRATIONS
-- =====================================================
-- Execute este arquivo no SQL Editor do Supabase
-- Dashboard -> SQL Editor -> New Query -> Cole e Execute

-- =====================================================
-- MIGRATION 1: EXPAND ROLE SYSTEM
-- =====================================================

-- 1. Remover constraint antigo de roles
ALTER TABLE organization_members
DROP CONSTRAINT IF EXISTS organization_members_role_check;

-- 2. Adicionar novo constraint com roles expandidos
ALTER TABLE organization_members
ADD CONSTRAINT organization_members_role_check
CHECK (role IN (
  'owner',      -- Proprietário da organização (máximo controle)
  'admin',      -- Administrador: acesso total + personalização
  'gestor',     -- Gestor: acesso a SDR + Monetização
  'sdr',        -- SDR: acesso apenas à seção SDR
  'comercial',  -- Comercial: acesso apenas à Monetização
  'member',     -- Membro genérico (compatibilidade)
  'viewer'      -- Visualizador (apenas leitura)
));

-- 3. Criar tabela de permissões de módulos
CREATE TABLE IF NOT EXISTS module_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  module_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(role, module_name)
);

-- 4. Popular permissões padrão
INSERT INTO module_permissions (role, module_name, can_view, can_edit, can_delete) VALUES
  -- OWNER: acesso total a tudo
  ('owner', 'dashboard', true, true, true),
  ('owner', 'resumo', true, true, true),
  ('owner', 'roi', true, true, true),
  ('owner', 'custos', true, true, true),
  ('owner', 'insights', true, true, true),
  ('owner', 'comparar-funis', true, true, true),
  ('owner', 'exportar', true, true, true),
  ('owner', 'aquisicao', true, true, true),
  ('owner', 'sdr', true, true, true),
  ('owner', 'monetizacao', true, true, true),
  ('owner', 'settings', true, true, true),

  -- ADMIN: acesso total + personalização
  ('admin', 'dashboard', true, true, true),
  ('admin', 'resumo', true, true, true),
  ('admin', 'roi', true, true, true),
  ('admin', 'custos', true, true, true),
  ('admin', 'insights', true, true, true),
  ('admin', 'comparar-funis', true, true, true),
  ('admin', 'exportar', true, true, true),
  ('admin', 'aquisicao', true, true, true),
  ('admin', 'sdr', true, true, true),
  ('admin', 'monetizacao', true, true, true),
  ('admin', 'settings', true, true, false),

  -- GESTOR: acesso a SDR + Monetização
  ('gestor', 'dashboard', true, false, false),
  ('gestor', 'resumo', true, false, false),
  ('gestor', 'sdr', true, true, false),
  ('gestor', 'monetizacao', true, true, false),
  ('gestor', 'exportar', true, false, false),

  -- SDR: apenas seção SDR
  ('sdr', 'sdr', true, true, false),
  ('sdr', 'exportar', true, false, false),

  -- COMERCIAL: apenas Monetização
  ('comercial', 'monetizacao', true, true, false),
  ('comercial', 'exportar', true, false, false),

  -- MEMBER: acesso de visualização geral
  ('member', 'dashboard', true, false, false),
  ('member', 'resumo', true, false, false),
  ('member', 'roi', true, false, false),
  ('member', 'custos', true, false, false),
  ('member', 'insights', true, false, false),
  ('member', 'comparar-funis', true, false, false),
  ('member', 'exportar', true, false, false),

  -- VIEWER: apenas visualização básica
  ('viewer', 'dashboard', true, false, false),
  ('viewer', 'resumo', true, false, false)
ON CONFLICT (role, module_name) DO NOTHING;

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_module_permissions_role ON module_permissions(role);
CREATE INDEX IF NOT EXISTS idx_module_permissions_module ON module_permissions(module_name);

-- 6. RLS para module_permissions
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view module permissions" ON module_permissions;
CREATE POLICY "Anyone can view module permissions"
  ON module_permissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only system can manage module permissions" ON module_permissions;
CREATE POLICY "Only system can manage module permissions"
  ON module_permissions FOR ALL
  USING (false);

-- 7. Function para verificar se usuário tem permissão em um módulo
CREATE OR REPLACE FUNCTION public.user_can_access_module(
  _user_id uuid,
  _org_id uuid,
  _module_name text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.module_permissions mp ON mp.role = om.role
    WHERE om.user_id = _user_id
      AND om.organization_id = _org_id
      AND mp.module_name = _module_name
      AND mp.can_view = true
  )
$$;

-- 8. Function para verificar se usuário pode editar um módulo
CREATE OR REPLACE FUNCTION public.user_can_edit_module(
  _user_id uuid,
  _org_id uuid,
  _module_name text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.module_permissions mp ON mp.role = om.role
    WHERE om.user_id = _user_id
      AND om.organization_id = _org_id
      AND mp.module_name = _module_name
      AND mp.can_edit = true
  )
$$;

-- 9. Atualizar constraint de invitations
ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_role_check;

ALTER TABLE invitations
ADD CONSTRAINT invitations_role_check
CHECK (role IN ('admin', 'gestor', 'sdr', 'comercial', 'member', 'viewer'));

-- =====================================================
-- MIGRATION 2: CREATE FUNNEL TABLES
-- =====================================================

-- 1. TABELA: acquisition_funnels
CREATE TABLE IF NOT EXISTS acquisition_funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  connection_id UUID REFERENCES spreadsheet_connections(id) ON DELETE SET NULL,
  monthly_investment DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_acquisition_funnels_org ON acquisition_funnels(organization_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_funnels_active ON acquisition_funnels(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_acquisition_funnels_connection ON acquisition_funnels(connection_id) WHERE connection_id IS NOT NULL;

-- 2. TABELA: acquisition_funnel_data
CREATE TABLE IF NOT EXISTS acquisition_funnel_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES acquisition_funnels(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_leads INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  scheduled INTEGER DEFAULT 0,
  calls_done INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  investment DECIMAL(10, 2) DEFAULT 0,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(funnel_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_acquisition_data_funnel ON acquisition_funnel_data(funnel_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_data_period ON acquisition_funnel_data(year, month);

-- 3. TABELA: sdr_funnels
CREATE TABLE IF NOT EXISTS sdr_funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sdr_funnels_org ON sdr_funnels(organization_id);
CREATE INDEX IF NOT EXISTS idx_sdr_funnels_owner ON sdr_funnels(owner_id);
CREATE INDEX IF NOT EXISTS idx_sdr_funnels_active ON sdr_funnels(is_active) WHERE is_active = true;

-- 4. TABELA: sdr_data
CREATE TABLE IF NOT EXISTS sdr_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES sdr_funnels(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,

  -- Leads por classificação
  leads_diamante INTEGER DEFAULT 0,
  leads_ouro INTEGER DEFAULT 0,
  leads_prata INTEGER DEFAULT 0,
  leads_bronze INTEGER DEFAULT 0,

  -- Agendamentos por classificação
  agendamentos_diamante INTEGER DEFAULT 0,
  agendamentos_ouro INTEGER DEFAULT 0,
  agendamentos_prata INTEGER DEFAULT 0,
  agendamentos_bronze INTEGER DEFAULT 0,

  -- Calls por classificação
  calls_diamante INTEGER DEFAULT 0,
  calls_ouro INTEGER DEFAULT 0,
  calls_prata INTEGER DEFAULT 0,
  calls_bronze INTEGER DEFAULT 0,

  -- Vendas por classificação
  vendas_diamante INTEGER DEFAULT 0,
  vendas_ouro INTEGER DEFAULT 0,
  vendas_prata INTEGER DEFAULT 0,
  vendas_bronze INTEGER DEFAULT 0,

  -- Totais
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

  -- Taxas gerais
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

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(funnel_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_sdr_data_funnel ON sdr_data(funnel_id);
CREATE INDEX IF NOT EXISTS idx_sdr_data_period ON sdr_data(year, month);

-- 5. TRIGGERS PARA UPDATED_AT
DROP TRIGGER IF EXISTS acquisition_funnels_updated_at ON acquisition_funnels;
CREATE TRIGGER acquisition_funnels_updated_at
  BEFORE UPDATE ON acquisition_funnels
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS acquisition_funnel_data_updated_at ON acquisition_funnel_data;
CREATE TRIGGER acquisition_funnel_data_updated_at
  BEFORE UPDATE ON acquisition_funnel_data
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS sdr_funnels_updated_at ON sdr_funnels;
CREATE TRIGGER sdr_funnels_updated_at
  BEFORE UPDATE ON sdr_funnels
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS sdr_data_updated_at ON sdr_data;
CREATE TRIGGER sdr_data_updated_at
  BEFORE UPDATE ON sdr_data
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS)

-- ACQUISITION_FUNNELS
ALTER TABLE acquisition_funnels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view org acquisition funnels" ON acquisition_funnels;
CREATE POLICY "Members can view org acquisition funnels"
  ON acquisition_funnels FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage acquisition funnels" ON acquisition_funnels;
CREATE POLICY "Admins can manage acquisition funnels"
  ON acquisition_funnels FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ACQUISITION_FUNNEL_DATA
ALTER TABLE acquisition_funnel_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view org acquisition data" ON acquisition_funnel_data;
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

DROP POLICY IF EXISTS "Admins can manage acquisition data" ON acquisition_funnel_data;
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

-- SDR_FUNNELS
ALTER TABLE sdr_funnels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view org sdr funnels" ON sdr_funnels;
CREATE POLICY "Members can view org sdr funnels"
  ON sdr_funnels FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins and SDRs can manage their funnels" ON sdr_funnels;
CREATE POLICY "Admins and SDRs can manage their funnels"
  ON sdr_funnels FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
        AND (role IN ('owner', 'admin', 'gestor') OR (role = 'sdr' AND owner_id = auth.uid()))
    )
  );

-- SDR_DATA
ALTER TABLE sdr_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view org sdr data" ON sdr_data;
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

DROP POLICY IF EXISTS "Authorized users can manage sdr data" ON sdr_data;
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

-- 7. HELPER FUNCTIONS

-- Function: Calcular custo por lead
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

-- Function: Calcular taxa de agendamento SDR
CREATE OR REPLACE FUNCTION public.calculate_sdr_scheduling_rate(
  _funnel_id uuid,
  _month text,
  _year integer,
  _classification text
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
-- CONCLUSÃO
-- =====================================================
SELECT 'Migrations aplicadas com sucesso! ✅' as status;
