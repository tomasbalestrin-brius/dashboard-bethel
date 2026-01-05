-- ============================================
-- FIX V2: Verificar e corrigir constraint + criar org
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Verificar se usuário existe em auth.users
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = '141e40b1-ab8d-4a65-b85e-c634df8a73b0'
  ) INTO user_exists;

  IF NOT user_exists THEN
    RAISE EXCEPTION 'Usuário 141e40b1-ab8d-4a65-b85e-c634df8a73b0 não existe em auth.users!';
  ELSE
    RAISE NOTICE 'Usuário encontrado em auth.users';
  END IF;
END $$;

-- PASSO 2: Verificar constraint atual
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table,
  pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
WHERE conrelid = 'public.organization_members'::regclass
  AND conname = 'organization_members_user_id_fkey';

-- PASSO 3: Se constraint apontar para public.users, corrigi-la
DO $$
DECLARE
  wrong_constraint BOOLEAN;
BEGIN
  -- Verificar se constraint aponta para public.users
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.organization_members'::regclass
      AND conname = 'organization_members_user_id_fkey'
      AND confrelid = 'public.users'::regclass
  ) INTO wrong_constraint;

  IF wrong_constraint THEN
    RAISE NOTICE 'Constraint aponta para public.users (ERRADO), corrigindo...';

    -- Remover constraint errada
    ALTER TABLE public.organization_members
    DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;

    -- Criar constraint correta apontando para auth.users
    ALTER TABLE public.organization_members
    ADD CONSTRAINT organization_members_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    RAISE NOTICE 'Constraint corrigida para apontar para auth.users';
  ELSE
    RAISE NOTICE 'Constraint já aponta corretamente para auth.users';
  END IF;
END $$;

-- PASSO 4: Criar organização para o usuário
DO $$
DECLARE
  target_user_id UUID := '141e40b1-ab8d-4a65-b85e-c634df8a73b0';
  new_org_id UUID;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Buscar email e nome do usuário
  SELECT u.email, COALESCE(p.full_name, u.email)
  INTO user_email, user_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE u.id = target_user_id;

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'Usuário % não encontrado', target_user_id;
  END IF;

  -- Verificar se já tem organização
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id
    AND current_organization_id IS NOT NULL
  ) THEN
    RAISE NOTICE 'Usuário % já tem organização', user_email;
    RETURN;
  END IF;

  -- Criar organização
  INSERT INTO public.organizations (
    name,
    slug,
    domain,
    logo_url,
    primary_color,
    secondary_color,
    favicon_url,
    plan,
    max_users,
    max_spreadsheets,
    features,
    status,
    created_at,
    updated_at
  ) VALUES (
    COALESCE(user_name, 'Minha Empresa'),
    LOWER(REPLACE(COALESCE(user_name, 'empresa'), ' ', '-')) || '-' || LEFT(target_user_id::TEXT, 8),
    NULL,
    NULL,
    'hsl(262.1, 83.3%, 57.8%)',
    'hsl(196.4, 100%, 48%)',
    NULL,
    'pro',
    50,
    10,
    '{}'::jsonb,
    'active',
    NOW(),
    NOW()
  )
  RETURNING id INTO new_org_id;

  RAISE NOTICE 'Organização % criada', new_org_id;

  -- Adicionar como owner
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    joined_at
  ) VALUES (
    new_org_id,
    target_user_id,
    'owner',
    NOW()
  );

  RAISE NOTICE 'Usuário adicionado como owner';

  -- Atualizar profile
  UPDATE public.profiles
  SET current_organization_id = new_org_id,
      updated_at = NOW()
  WHERE id = target_user_id;

  RAISE NOTICE 'Profile atualizado. Organização % criada para usuário %', new_org_id, user_email;
END $$;

-- PASSO 5: Verificar resultado
SELECT
  'Status Final' as check_type,
  p.id,
  p.full_name,
  u.email,
  p.current_organization_id,
  o.name as org_name,
  om.role
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN public.organizations o ON p.current_organization_id = o.id
LEFT JOIN public.organization_members om
  ON p.id = om.user_id
  AND p.current_organization_id = om.organization_id
WHERE p.id = '141e40b1-ab8d-4a65-b85e-c634df8a73b0';
