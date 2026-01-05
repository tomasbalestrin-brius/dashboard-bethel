-- ============================================
-- COLE TUDO ISSO NO SUPABASE E CLIQUE RUN
-- ============================================
-- Link: https://supabase.com/dashboard/project/eunyqaesqqavdvehljkn/sql/new

-- PASSO 1: RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- PASSO 2: Auto-criar profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASSO 3: Criar profiles para usuários existentes
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), created_at, NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- VERIFICAR SE FUNCIONOU
SELECT 'Profiles criados:', COUNT(*) FROM profiles;
SELECT 'Usuários totais:', COUNT(*) FROM auth.users;
