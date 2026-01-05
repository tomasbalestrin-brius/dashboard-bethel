-- ============================================
-- SOLUÇÃO UNIVERSAL: Cria org para TODOS usuários sem org
-- Execute no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Listar TODOS os usuários reais em auth.users
SELECT
  '1. Usuários em auth.users' as info,
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC;

-- PASSO 2: Listar profiles existentes
SELECT
  '2. Profiles existentes' as info,
  p.id,
  p.full_name,
  p.current_organization_id,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- PASSO 3: Mostrar usuários SEM organização
SELECT
  '3. Usuários SEM organização' as info,
  u.id,
  u.email,
  p.full_name,
  p.current_organization_id
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.current_organization_id IS NULL OR p.current_organization_id NOT IN (
  SELECT id FROM public.organizations
);

-- PASSO 4: Corrigir constraint se necessário
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
    RAISE NOTICE 'Corrigindo constraint...';

    ALTER TABLE public.organization_members
    DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;

    ALTER TABLE public.organization_members
    ADD CONSTRAINT organization_members_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    RAISE NOTICE 'Constraint corrigida!';
  ELSE
    RAISE NOTICE 'Constraint já está correta';
  END IF;
END $$;

-- PASSO 5: Criar organizações para TODOS os usuários sem org
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  user_email TEXT;
  user_name TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- Iterar sobre TODOS os usuários em auth.users
  FOR user_record IN
    SELECT
      u.id,
      u.email,
      COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email) as name,
      p.current_organization_id
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
  LOOP
    user_email := user_record.email;
    user_name := user_record.name;

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
      RAISE NOTICE 'Profile criado para %', user_email;
    END IF;

    -- Verificar se já tem organização válida
    IF user_record.current_organization_id IS NULL OR
       NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = user_record.current_organization_id)
    THEN
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
        user_name || '''s Organization',
        LOWER(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || LEFT(user_record.id::TEXT, 8),
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

      RAISE NOTICE 'Organização % criada para %', new_org_id, user_email;

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
      );

      RAISE NOTICE 'Usuário % adicionado como owner', user_email;

      -- Atualizar profile
      UPDATE public.profiles
      SET current_organization_id = new_org_id,
          updated_at = NOW()
      WHERE id = user_record.id;

      RAISE NOTICE '✅ Organização configurada para %', user_email;
    ELSE
      RAISE NOTICE 'Usuário % já tem organização', user_email;
    END IF;
  END LOOP;
END $$;

-- PASSO 6: Verificar resultado final
SELECT
  '6. Status Final - Todos os Usuários' as info,
  u.id,
  u.email,
  p.full_name,
  p.current_organization_id,
  o.name as org_name,
  om.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.organizations o ON p.current_organization_id = o.id
LEFT JOIN public.organization_members om
  ON p.id = om.user_id
  AND p.current_organization_id = om.organization_id
ORDER BY u.created_at DESC;
