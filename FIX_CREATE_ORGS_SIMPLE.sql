-- ============================================
-- SOLUÇÃO SIMPLES: Cria org para todos usuários
-- SEM verificar constraint (evita erro se public.users não existe)
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Listar TODOS os usuários reais em auth.users
SELECT
  '1. Usuários Reais em auth.users' as info,
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC;

-- PASSO 2: Listar profiles existentes e suas organizações
SELECT
  '2. Profiles e Organizações Atuais' as info,
  p.id,
  p.full_name,
  p.current_organization_id,
  u.email,
  o.name as org_name
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN public.organizations o ON p.current_organization_id = o.id
ORDER BY p.created_at DESC;

-- PASSO 3: Criar organizações para TODOS os usuários sem org
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  user_email TEXT;
  user_name TEXT;
  profile_exists BOOLEAN;
  has_valid_org BOOLEAN;
BEGIN
  RAISE NOTICE '=== INICIANDO CRIAÇÃO DE ORGANIZAÇÕES ===';

  -- Iterar sobre TODOS os usuários em auth.users
  FOR user_record IN
    SELECT
      u.id,
      u.email,
      COALESCE(
        p.full_name,
        u.raw_user_meta_data->>'full_name',
        SPLIT_PART(u.email, '@', 1)
      ) as name,
      p.current_organization_id
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
  LOOP
    user_email := user_record.email;
    user_name := user_record.name;

    RAISE NOTICE '';
    RAISE NOTICE '--- Processando usuário: % (ID: %) ---', user_email, user_record.id;

    -- Verificar se profile existe
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = user_record.id
    ) INTO profile_exists;

    -- Criar profile se não existir
    IF NOT profile_exists THEN
      INSERT INTO public.profiles (
        id, full_name, created_at, updated_at
      ) VALUES (
        user_record.id, user_name, NOW(), NOW()
      );
      RAISE NOTICE '✅ Profile criado para %', user_email;
    ELSE
      RAISE NOTICE '📋 Profile já existe para %', user_email;
    END IF;

    -- Verificar se tem organização válida
    SELECT EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = user_record.current_organization_id
    ) INTO has_valid_org;

    -- Criar organização se não tiver ou se for inválida
    IF user_record.current_organization_id IS NULL OR NOT has_valid_org THEN
      IF user_record.current_organization_id IS NOT NULL AND NOT has_valid_org THEN
        RAISE NOTICE '⚠️  Organização inválida detectada, criando nova...';
      ELSE
        RAISE NOTICE '📌 Usuário sem organização, criando...';
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
        user_name,
        LOWER(REGEXP_REPLACE(user_name || '-' || LEFT(user_record.id::TEXT, 8), '[^a-z0-9-]', '-', 'g')),
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

      RAISE NOTICE '✅ Organização criada: % (ID: %)', user_name, new_org_id;

      -- Adicionar como owner
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
      )
      ON CONFLICT DO NOTHING;

      RAISE NOTICE '✅ Usuário adicionado como OWNER';

      -- Atualizar profile
      UPDATE public.profiles
      SET current_organization_id = new_org_id,
          updated_at = NOW()
      WHERE id = user_record.id;

      RAISE NOTICE '✅ Profile atualizado com organização';
      RAISE NOTICE '🎉 SUCESSO: Organização configurada para %!', user_email;
    ELSE
      RAISE NOTICE '✓ Usuário % já tem organização válida', user_email;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== PROCESSO CONCLUÍDO ===';
END $$;

-- PASSO 4: Verificar resultado final
SELECT
  '4. ✅ RESULTADO FINAL - Todos os Usuários' as info,
  u.id,
  u.email,
  p.full_name,
  p.current_organization_id as org_id,
  o.name as org_name,
  o.slug as org_slug,
  om.role as user_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.organizations o ON p.current_organization_id = o.id
LEFT JOIN public.organization_members om
  ON p.id = om.user_id
  AND p.current_organization_id = om.organization_id
ORDER BY u.created_at DESC;
