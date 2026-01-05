-- ============================================
-- FIX ESPECÍFICO PARA USUÁRIO 141e40b1-ab8d-4a65-b85e-c634df8a73b0
-- Execute no SQL Editor do Supabase
-- ============================================

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

  -- Atualizar profile
  UPDATE public.profiles
  SET current_organization_id = new_org_id,
      updated_at = NOW()
  WHERE id = target_user_id;

  RAISE NOTICE 'Organização % criada para usuário %', new_org_id, user_email;
END $$;

-- Verificar resultado
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
