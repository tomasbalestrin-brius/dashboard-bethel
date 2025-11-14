-- =====================================================
-- MULTI-TENANCY SCHEMA
-- =====================================================

-- TABELA: organizations (tenants)
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  
  -- White Label
  logo_url TEXT,
  primary_color TEXT DEFAULT '#8b5cf6',
  secondary_color TEXT DEFAULT '#ec4899',
  favicon_url TEXT,
  
  -- Plano e Limites
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  max_users INTEGER DEFAULT 3,
  max_spreadsheets INTEGER DEFAULT 1,
  features JSONB DEFAULT '{}',
  
  -- Dados de contato
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  billing_email TEXT,
  phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organizations_status ON organizations(status) WHERE status = 'active';

-- TABELA: organization_members (usuários da org)
CREATE TABLE organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Role do usuário na organização
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraint: um usuário não pode estar duplicado na mesma org
  UNIQUE(organization_id, user_id)
);

-- Índices
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);

-- TABELA: spreadsheet_connections (conexões com Google Sheets)
CREATE TABLE spreadsheet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados da conexão
  spreadsheet_id TEXT NOT NULL,
  spreadsheet_name TEXT NOT NULL,
  api_key TEXT,
  
  -- Configuração
  sync_frequency TEXT DEFAULT 'manual' CHECK (sync_frequency IN ('manual', 'hourly', 'daily')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'error', 'disabled')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_spreadsheets_org ON spreadsheet_connections(organization_id);
CREATE INDEX idx_spreadsheets_status ON spreadsheet_connections(status) WHERE status = 'active';

-- TABELA: invitations (convites para org)
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status) WHERE status = 'pending';

-- ATUALIZAR: profiles (adicionar organization_id)
ALTER TABLE profiles
ADD COLUMN current_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Índice
CREATE INDEX idx_profiles_current_org ON profiles(current_organization_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Organizations: usuários podem ver apenas orgs que pertencem
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own organizations"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Organization Members: apenas membros da org podem ver
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own organization members"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Spreadsheets: apenas membros da org podem ver/editar
ALTER TABLE spreadsheet_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org spreadsheets"
  ON spreadsheet_connections FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage spreadsheets"
  ON spreadsheet_connections FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Invitations: apenas membros da org podem ver/gerenciar
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org invitations"
  ON invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update invitations"
  ON invitations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete invitations"
  ON invitations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Function: verificar se usuário tem role específica na org
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- Function: verificar se usuário é admin da org
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
$$;

-- Function: contar membros da org
CREATE OR REPLACE FUNCTION public.count_org_members(_org_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.organization_members
  WHERE organization_id = _org_id
$$;

-- Function: verificar limite de usuários
CREATE OR REPLACE FUNCTION public.check_user_limit(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.count_org_members(_org_id) < (
    SELECT max_users FROM public.organizations WHERE id = _org_id
  )
$$;

-- Function: pegar organização atual do usuário
CREATE OR REPLACE FUNCTION public.get_current_organization()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_organization_id
  FROM public.profiles
  WHERE id = auth.uid()
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: criar organização padrão ao criar usuário
CREATE OR REPLACE FUNCTION public.create_default_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
  user_name text;
  unique_slug text;
BEGIN
  -- Pegar nome do usuário ou usar email
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
  
  -- Gerar slug único
  unique_slug := LOWER(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]', '', 'g')) || '-' || SUBSTR(NEW.id::text, 1, 8);
  
  -- Criar organização
  INSERT INTO public.organizations (name, slug, owner_id)
  VALUES (
    user_name || '''s Workspace',
    unique_slug,
    NEW.id
  )
  RETURNING id INTO org_id;
  
  -- Adicionar usuário como owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');
  
  -- Setar como organização atual no perfil (será criado pelo trigger handle_new_user)
  -- Usamos um pequeno delay via trigger separado
  
  RETURN NEW;
END;
$$;

-- Trigger: atualizar current_organization_id no profile após criação
CREATE OR REPLACE FUNCTION public.set_default_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_org_id uuid;
BEGIN
  -- Buscar organização do usuário
  SELECT organization_id INTO default_org_id
  FROM public.organization_members
  WHERE user_id = NEW.id
  LIMIT 1;
  
  -- Atualizar profile
  IF default_org_id IS NOT NULL THEN
    NEW.current_organization_id := default_org_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_create_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_organization();

CREATE TRIGGER on_profile_created_set_org
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_default_organization();

-- Trigger: atualizar updated_at em organizations
CREATE TRIGGER org_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: atualizar updated_at em spreadsheet_connections
CREATE TRIGGER spreadsheet_updated_at
  BEFORE UPDATE ON public.spreadsheet_connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();