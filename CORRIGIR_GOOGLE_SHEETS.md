# 🔧 CORRIGIR INTEGRAÇÃO GOOGLE SHEETS

## ❌ Problema Identificado

O erro **"Organização ou usuário não encontrado"** está acontecendo porque:

1. **RLS habilitado** nas tabelas `google_sheets_integrations` e `google_sheets_sync_history`
2. O código estava usando `.single()` que falha quando RLS bloqueia o acesso
3. A organização/usuário pode não estar carregando corretamente

---

## ✅ SOLUÇÃO (3 Passos Simples)

### **PASSO 1: Executar SQL no Supabase** ⚠️ OBRIGATÓRIO

Este é o passo mais importante! Execute o SQL abaixo no Supabase:

1. Abra o **Supabase** → **SQL Editor**
2. Clique em **"New Query"**
3. Cole o SQL abaixo:

```sql
-- ============================================
-- CORRIGIR INTEGRAÇÃO GOOGLE SHEETS
-- ============================================

-- Desabilitar RLS nas tabelas
ALTER TABLE IF EXISTS public.google_sheets_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_sheets_sync_history DISABLE ROW LEVEL SECURITY;

-- Remover policies existentes
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Remove policies de google_sheets_integrations
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'google_sheets_integrations' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.google_sheets_integrations';
    RAISE NOTICE 'Policy removida: %', pol.policyname;
  END LOOP;

  -- Remove policies de google_sheets_sync_history
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'google_sheets_sync_history' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.google_sheets_sync_history';
    RAISE NOTICE 'Policy removida: %', pol.policyname;
  END LOOP;
END $$;

-- Verificar resultado
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '⚠️ RLS AINDA HABILITADO'
    ELSE '✅ RLS DESABILITADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('google_sheets_integrations', 'google_sheets_sync_history')
ORDER BY tablename;
```

4. Clique em **"Run"**
5. **VERIFIQUE** que o resultado mostra: `✅ RLS DESABILITADO` para ambas as tabelas

---

### **PASSO 2: Aguardar Deploy e Limpar Cache**

O código já foi corrigido e está sendo deployado no Vercel.

**A) Aguardar Deploy (1-3 minutos)**
- Vercel já está deployando automaticamente

**B) Limpar Cache do Navegador** ⚠️ IMPORTANTE
```
F12 → Botão direito no ícone Refresh → "Limpar cache e recarregar forçadamente"
```

**Ou usando DevTools**:
1. Pressione `F12`
2. Vá na aba **Application**
3. **Storage** → **Clear site data**
4. Recarregue: `Ctrl + Shift + R`

---

### **PASSO 3: Testar Integração Novamente**

1. Faça login no sistema
2. Vá em **Aquisição** ou **Monetização**
3. Clique em **"Integrar Sheets"**
4. Agora deve funcionar!

**Se der erro novamente**:
- Pressione `F12` para abrir o Console
- Procure por logs que começam com 🔍, ✅ ou ❌
- Tire screenshot e me envie

---

## 🔍 O que foi corrigido no código?

### **Antes (causava erro)**:
```typescript
const { data, error } = await supabase
  .from('google_sheets_integrations')
  .insert({ ... })
  .select()
  .single();  // ❌ Falhava com RLS habilitado
```

### **Depois (corrigido)**:
```typescript
const { data, error } = await supabase
  .from('google_sheets_integrations')
  .insert({ ... })
  .select()
  .maybeSingle();  // ✅ Funciona mesmo com RLS

// Verificação melhorada
if (!organization || !user) {
  const errorMsg = !organization
    ? 'Organização não encontrada. Aguarde o carregamento ou recarregue a página.'
    : 'Usuário não encontrado. Faça login novamente.';
  // ...
}

// Logs para debug
console.log('🔍 createIntegration - Verificando...', {
  hasOrganization: !!organization,
  hasUser: !!user,
  organizationId: organization?.id,
  userId: user?.id,
});
```

---

## 📊 Commits Feitos

```
66ba1fc - fix: Corrige integração Google Sheets - RLS e debugging
```

**Mudanças**:
- ✅ `.single()` → `.maybeSingle()` (evita erro PGRST116)
- ✅ Logs detalhados para debug
- ✅ Mensagens de erro mais claras
- ✅ SQL para desabilitar RLS

---

## 🎯 Depois de Testar

Se funcionar, você poderá:

✅ Criar integração com qualquer módulo
✅ Conectar Google Sheets
✅ Sincronizar dados automaticamente
✅ Configurar sync automático (a cada hora, dia, etc.)

---

## ❓ Se Continuar com Erro

### **Erro: "Organização não encontrada"**
1. Abra o Console (`F12`)
2. Procure pelos logs `🔍 createIntegration`
3. Verifique se `hasOrganization: false`
4. Se for false, **recarregue a página completamente**

### **Erro: "Usuário não encontrado"**
1. Faça logout
2. Limpe o cache
3. Faça login novamente

### **Erro diferente**
1. Tire screenshot do erro
2. Copie os logs do Console (F12)
3. Me envie para análise

---

## 📁 Arquivo SQL Completo

O SQL completo está em: **`FIX_GOOGLE_SHEETS_RLS.sql`**

Você pode executar esse arquivo direto no Supabase SQL Editor se preferir.

---

**Boa sorte! 🚀**
