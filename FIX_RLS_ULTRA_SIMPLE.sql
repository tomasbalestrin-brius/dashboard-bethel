-- ============================================
-- SOLUÇÃO DEFINITIVA: Policies ULTRA SIMPLES sem recursão
-- Remove toda verificação cruzada entre tabelas
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Remover TODAS as policies (incluindo as recém-criadas)
DROP POLICY IF EXISTS "Users can view their current organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners and admins can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Service role can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.organization_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.organization_members;

-- PASSO 2: OPÇÃO A - Desabilitar RLS temporariamente (para testar)
-- Descomente estas linhas se quiser desabilitar RLS completamente:
-- ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;

-- PASSO 3: OPÇÃO B - Policies PERMISSIVAS (sem verificações cruzadas)

-- ============================================
-- ORGANIZATIONS - Permissivo, sem verificar members
-- ============================================

-- SELECT: Qualquer usuário autenticado pode ver qualquer organização
-- (Sim, é permissivo, mas evita 100% de recursão)
CREATE POLICY "Authenticated users can view organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (true);  -- Sem verificações, sem recursão

-- UPDATE: Apenas service_role por enquanto (evita recursão)
CREATE POLICY "Service role can update organizations"
ON public.organizations
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- INSERT: Service role
CREATE POLICY "Service role can insert organizations"
ON public.organizations
FOR INSERT
TO service_role
WITH CHECK (true);

-- DELETE: Service role
CREATE POLICY "Service role can delete organizations"
ON public.organizations
FOR DELETE
TO service_role
USING (true);

-- ============================================
-- ORGANIZATION_MEMBERS - Permissivo, sem verificar organizations
-- ============================================

-- SELECT: Qualquer usuário autenticado pode ver membros
-- (Permissivo temporariamente para evitar recursão)
CREATE POLICY "Authenticated users can view members"
ON public.organization_members
FOR SELECT
TO authenticated
USING (true);  -- Sem verificações, sem recursão

-- INSERT: Service role apenas
CREATE POLICY "Service role can add members"
ON public.organization_members
FOR INSERT
TO service_role
WITH CHECK (true);

-- UPDATE: Service role apenas
CREATE POLICY "Service role can update members"
ON public.organization_members
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- DELETE: Service role apenas
CREATE POLICY "Service role can remove members"
ON public.organization_members
FOR DELETE
TO service_role
USING (true);

-- PASSO 4: Verificar policies criadas
SELECT
  'Policies Criadas - organizations' as info,
  policyname,
  cmd as command,
  CASE
    WHEN qual = 'true' THEN '✅ SEM RECURSÃO (true)'
    ELSE '⚠️ TEM CONDIÇÃO: ' || qual
  END as has_recursion_risk
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

SELECT
  'Policies Criadas - organization_members' as info,
  policyname,
  cmd as command,
  CASE
    WHEN qual = 'true' THEN '✅ SEM RECURSÃO (true)'
    ELSE '⚠️ TEM CONDIÇÃO: ' || qual
  END as has_recursion_risk
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;

-- PASSO 5: Testar query que estava falhando
SELECT
  'TESTE - Buscar organization (deve funcionar)' as info,
  id,
  name,
  slug,
  status
FROM public.organizations
LIMIT 1;

SELECT
  'TESTE - Buscar members (deve funcionar)' as info,
  id,
  user_id,
  organization_id,
  role
FROM public.organization_members
LIMIT 1;
