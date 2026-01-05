-- ============================================
-- SCRIPT PARA CORRIGIR USUÁRIOS SEM ORGANIZAÇÃO
-- Execute no SQL Editor do Supabase
-- ============================================

-- Este script faz o seguinte:
-- 1. Para cada profile sem current_organization_id
-- 2. Cria uma organização padrão para o usuário
-- 3. Adiciona o usuário como 'owner' da organização
-- 4. Atualiza o profile com a nova organização

DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Iterar sobre todos os profiles sem organização
  FOR user_record IN
    SELECT p.id, p.full_name, u.email
    FROM public.profiles p
    LEFT JOIN auth.users u ON p.id = u.id
    WHERE p.current_organization_id IS NULL
  LOOP
    -- Pegar email e nome do usuário
    user_email := COALESCE(user_record.email, 'user@example.com');
    user_name := COALESCE(user_record.full_name, 'Minha Empresa');

    -- Criar organização para o usuário
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
      user_name || '''s Organization',
      LOWER(REPLACE(user_name, ' ', '-')) || '-' || LEFT(user_record.id::TEXT, 8),
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

    -- Adicionar usuário como owner da organização
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role,
      joined_at
    ) VALUES (
      new_org_id,
      user_record.id,
      'owner',
      NOW()
    );

    -- Atualizar profile com a nova organização
    UPDATE public.profiles
    SET current_organization_id = new_org_id,
        updated_at = NOW()
    WHERE id = user_record.id;

    RAISE NOTICE 'Criada organização % para usuário %', new_org_id, user_email;
  END LOOP;
END $$;

-- Verificar resultado
SELECT
  'Profiles após correção' as status,
  p.id,
  p.full_name,
  p.current_organization_id,
  o.name as org_name,
  om.role
FROM public.profiles p
LEFT JOIN public.organizations o ON p.current_organization_id = o.id
LEFT JOIN public.organization_members om
  ON p.id = om.user_id
  AND p.current_organization_id = om.organization_id;
