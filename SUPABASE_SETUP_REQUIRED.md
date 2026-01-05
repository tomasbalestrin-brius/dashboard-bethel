# 🔧 Configuração Necessária no Supabase

## ❗ IMPORTANTE: Execute isso no SQL Editor do Supabase

**Link direto:** https://supabase.com/dashboard/project/eunyqaesqqavdvehljkn/sql/new

---

## 📋 Etapa 1: RLS Policies (Resolver erro 406)

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas que podem estar conflitando
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Criar policy de SELECT correta
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Garantir permissões
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
```

**Resultado esperado:**
```
✅ Policy criada com sucesso
```

---

## 📋 Etapa 2: Auto-criar Profiles (Resolver erro PGRST116)

```sql
-- Função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger para executar quando usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Criar profiles para usuários EXISTENTES
INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Verificar se funcionou
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles)
    THEN '✅ Todos os usuários têm profiles!'
    ELSE '⚠️ Ainda faltam ' ||
         ((SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles))::text ||
         ' profiles'
  END as status;
```

**Resultado esperado:**
```
total_users | total_profiles | status
------------|----------------|---------------------------
     5      |      5         | ✅ Todos os usuários têm profiles!
```

---

## ✅ Como Verificar se Funcionou

Após executar os dois SQLs acima:

1. **Faça logout** da aplicação
2. **Faça login** novamente
3. **Não deve mais aparecer** os erros:
   - ❌ `406 Not Acceptable`
   - ❌ `PGRST116: Cannot coerce the result to a single JSON object`

4. **Console deve mostrar:**
   ```
   ✅ Organization loaded successfully
   ```

---

## 🚨 Se ainda der erro

**Verifique no Supabase:**

```sql
-- Ver todas as policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'profiles';

-- Ver quantos profiles existem
SELECT COUNT(*) FROM profiles;

-- Ver quantos usuários existem
SELECT COUNT(*) FROM auth.users;
```

**Resposta esperada:**
- Policies: `Users can read own profile` e `Users can update own profile`
- Número de profiles = Número de usuários

---

## 📞 Depois disso

Quando os erros 406 pararem:

1. ✅ Configure as variáveis de ambiente no Vercel
2. ✅ Faça merge da branch para main
3. ✅ Deploy para produção

---

**Última atualização:** 2026-01-05
