-- ============================================
-- CORRIGIR RECURSÃO INFINITA NAS RLS POLICIES
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Ver policies atuais que causam recursão
SELECT
  '1. Policies de organization_members (PROBLEMA)' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;

SELECT
  '2. Policies de organizations' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

-- PASSO 2: Remover TODAS as policies antigas (causam recursão)
DROP POLICY IF EXISTS "Users can view own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can update own organization" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;
DROP POLICY IF EXISTS "Members can view their organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can manage members" ON public.organization_members;

-- PASSO 3: Criar policies SEM recursão

-- ============================================
-- ORGANIZATIONS - Policies simples sem recursão
-- ============================================

-- Permitir SELECT: usuário vê org se current_organization_id aponta para ela
CREATE POLICY "Users can view their current organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  -- Verifica diretamente na tabela profiles (SEM verificar members)
  id IN (
    SELECT current_organization_id
    FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Permitir UPDATE: apenas se for owner ou admin (verifica diretamente em members)
CREATE POLICY "Owners and admins can update organization"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  -- Verifica role diretamente em organization_members
  id IN (
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  id IN (
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Permitir INSERT: apenas service_role (não permitir criação via UI por enquanto)
CREATE POLICY "Service role can insert organizations"
ON public.organizations
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- ORGANIZATION_MEMBERS - Policies simples sem recursão
-- ============================================

-- Permitir SELECT: usuário vê members da sua org atual
CREATE POLICY "Users can view members of their organization"
ON public.organization_members
FOR SELECT
TO authenticated
USING (
  -- Verifica se organization_id é a atual do usuário (SEM verificar organizations)
  organization_id IN (
    SELECT current_organization_id
    FROM public.profiles
    WHERE id = auth.uid()
  )
  OR user_id = auth.uid()  -- Ou se é o próprio usuário
);

-- Permitir INSERT: apenas owners e admins
CREATE POLICY "Owners and admins can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  -- Verifica se usuário é owner/admin da org (SEM loop)
  organization_id IN (
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Permitir UPDATE: apenas owners e admins
CREATE POLICY "Owners and admins can update members"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Permitir DELETE: apenas owners e admins
CREATE POLICY "Owners and admins can remove members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- PASSO 4: Verificar policies criadas
SELECT
  '4. ✅ Novas Policies - organization_members' as info,
  schemaname,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;

SELECT
  '5. ✅ Novas Policies - organizations' as info,
  schemaname,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

-- PASSO 5: Testar acesso (deve retornar sua organização)
SELECT
  '6. ✅ TESTE - Sua Organização (deve aparecer)' as info,
  id,
  name,
  slug,
  status
FROM public.organizations
WHERE id IN (
  SELECT current_organization_id
  FROM public.profiles
  WHERE id = auth.uid()
);
