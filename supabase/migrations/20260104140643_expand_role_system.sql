-- =====================================================
-- EXPAND ROLE SYSTEM
-- =====================================================
-- Migration para expandir o sistema de roles
-- Adiciona roles específicos para o dashboard de marketing/vendas

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
-- Esta tabela define quais módulos cada role pode acessar
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
  ('viewer', 'resumo', true, false, false);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_module_permissions_role ON module_permissions(role);
CREATE INDEX IF NOT EXISTS idx_module_permissions_module ON module_permissions(module_name);

-- 6. RLS para module_permissions (todos podem ler, apenas admins podem modificar)
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view module permissions"
  ON module_permissions FOR SELECT
  USING (true);

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

-- 9. Atualizar constraint de invitations para incluir novos roles
ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_role_check;

ALTER TABLE invitations
ADD CONSTRAINT invitations_role_check
CHECK (role IN ('admin', 'gestor', 'sdr', 'comercial', 'member', 'viewer'));

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE module_permissions IS 'Define quais módulos cada role pode acessar e com quais permissões';
COMMENT ON FUNCTION user_can_access_module IS 'Verifica se um usuário pode visualizar um módulo específico';
COMMENT ON FUNCTION user_can_edit_module IS 'Verifica se um usuário pode editar dados em um módulo específico';
