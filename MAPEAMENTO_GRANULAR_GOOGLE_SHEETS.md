# 🎯 Mapeamento Granular de Dados - Google Sheets

## ✨ O que é?

Agora você pode **configurar EXATAMENTE de onde cada card/métrica do dashboard vem na sua planilha Google Sheets**!

### Antes (limitado):
- ❌ Importava a planilha inteira
- ❌ Sem controle sobre quais dados vão para onde

### Agora (flexível): ⭐
- ✅ Cada card pode ter origem diferente
- ✅ Suporta células, ranges ou fórmulas
- ✅ Agregações: soma, média, contagem, último valor
- ✅ Formatos personalizados: moeda, porcentagem, etc.

---

## 🚀 Como Usar

### **1. Execute o SQL no Supabase**

**IMPORTANTE**: Antes de tudo, execute este SQL no Supabase SQL Editor:

```sql
-- Criar tabela de mapeamentos
CREATE TABLE IF NOT EXISTS public.google_sheets_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.google_sheets_integrations(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('cell', 'range', 'formula')),
  source_value TEXT NOT NULL,
  aggregation TEXT NOT NULL CHECK (aggregation IN ('value', 'sum', 'average', 'count', 'last', 'formula')),
  format TEXT NOT NULL CHECK (format IN ('number', 'currency', 'percentage', 'text', 'date')),
  custom_formula TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_field_mappings_integration_id
  ON public.google_sheets_field_mappings(integration_id);

-- Desabilitar RLS
ALTER TABLE public.google_sheets_field_mappings DISABLE ROW LEVEL SECURITY;
```

**OU** execute o arquivo completo: `CREATE_GOOGLE_SHEETS_FIELD_MAPPINGS_TABLE.sql`

---

### **2. Configure a Integração**

1. Vá em qualquer módulo (ex: **Aquisição**)
2. Clique em **"Integrar Sheets"**
3. Siga o wizard:

#### **Passo 1: Selecionar Planilha**
- Cole URL da planilha Google Sheets
- Informe nome da aba

#### **Passo 2: Configurar Dados**
- **IMPORTANTE**: Escolha **"📥 Importar"** ou **"🔄 Ambos"**
- Se escolher apenas "Exportar", o mapeamento é pulado

#### **Passo 3: Mapear Dados** ⭐ **NOVO!**
Você verá uma lista de todos os cards do módulo. Para cada card, configure:

---

## 📊 Tipos de Configuração

### **A) Célula Única**
Use quando o valor está em uma célula específica.

**Exemplo:**
```
Card: Total de Vendas
Tipo: 📍 Célula única
Origem: B5
Agregação: Valor único
Formato: Moeda (R$)
```

**Resultado**: Pega o valor da célula B5 e exibe como R$ 1.500,00

---

### **B) Range (Intervalo)**
Use quando precisa agregar múltiplas células.

**Exemplo 1 - Soma:**
```
Card: Receita Total
Tipo: 📊 Range
Origem: D10:D50
Agregação: Soma
Formato: Moeda (R$)
```

**Resultado**: Soma todos os valores de D10 até D50

**Exemplo 2 - Média:**
```
Card: Custo Médio por Lead
Tipo: 📊 Range
Origem: E:E
Agregação: Média
Formato: Moeda (R$)
```

**Resultado**: Calcula média de toda coluna E

**Exemplo 3 - Contagem:**
```
Card: Total de Leads
Tipo: 📊 Range
Origem: A2:A1000
Agregação: Contagem
Formato: Número
```

**Resultado**: Conta quantas células não vazias existem

**Exemplo 4 - Último Valor:**
```
Card: Vendas do Mês Atual
Tipo: 📊 Range
Origem: B:B
Agregação: Último valor
Formato: Número
```

**Resultado**: Pega o último valor não vazio da coluna B

---

### **C) Fórmula Customizada**
Use quando precisa de cálculos complexos.

**Exemplo 1 - Taxa de Conversão:**
```
Card: Taxa de Conversão
Tipo: 🧮 Fórmula customizada
Origem: =(B10/B5)*100
Agregação: Fórmula
Formato: Porcentagem (%)
```

**Resultado**: Divide B10 por B5, multiplica por 100 e exibe como %

**Exemplo 2 - ROI:**
```
Card: ROI
Tipo: 🧮 Fórmula customizada
Origem: =((C5-D5)/D5)*100
Agregação: Fórmula
Formato: Porcentagem (%)
```

**Resultado**: Calcula ROI = ((Receita - Investimento) / Investimento) * 100

**Exemplo 3 - Média Ponderada:**
```
Card: Ticket Médio
Tipo: 🧮 Fórmula customizada
Origem: =SUM(E:E)/COUNTA(A:A)
Agregação: Fórmula
Formato: Moeda (R$)
```

**Resultado**: Soma da coluna E dividido pela contagem de A

---

## 🎨 Formatos Disponíveis

| Formato | Exemplo de Exibição | Quando Usar |
|---------|---------------------|-------------|
| 🔢 Número | 1.500 | Quantidade, contagem |
| 💰 Moeda (R$) | R$ 1.500,00 | Valores monetários |
| 📊 Porcentagem (%) | 15,5% | Taxas, percentuais |
| 📝 Texto | "Ativo" | Textos, status |
| 📅 Data | 01/01/2024 | Datas |

---

## 💡 Exemplos Práticos por Módulo

### **Módulo Aquisição**

#### Card: Total de Leads
```
Tipo: Range
Origem: B:B
Agregação: Contagem
Formato: Número
```
Conta quantos leads existem na coluna B.

#### Card: Investimento
```
Tipo: Célula única
Origem: D5
Agregação: Valor único
Formato: Moeda (R$)
```
Pega o investimento total da célula D5.

#### Card: Custo por Lead
```
Tipo: Fórmula
Origem: =D5/COUNTA(B:B)
Agregação: Fórmula
Formato: Moeda (R$)
```
Divide investimento (D5) pelo total de leads (contagem de B).

---

### **Módulo Monetização**

#### Card: Receita Bruta
```
Tipo: Range
Origem: E10:E50
Agregação: Soma
Formato: Moeda (R$)
```
Soma todas as receitas de E10 até E50.

#### Card: Margem Líquida
```
Tipo: Fórmula
Origem: =((SUM(E:E)-SUM(F:F))/SUM(E:E))*100
Agregação: Fórmula
Formato: Porcentagem (%)
```
Calcula (Receita - Custos) / Receita * 100.

#### Card: ROI
```
Tipo: Célula única
Origem: G5
Agregação: Valor único
Formato: Porcentagem (%)
```
Pega ROI já calculado na célula G5.

---

### **Módulo SDR**

#### Card: Taxa de Agendamento
```
Tipo: Fórmula
Origem: =(C10/B10)*100
Agregação: Fórmula
Formato: Porcentagem (%)
```
Divide agendamentos (C10) por leads (B10).

#### Card: Vendas
```
Tipo: Range
Origem: D:D
Agregação: Soma
Formato: Número
```
Soma todas as vendas da coluna D.

---

## 🔍 Dicas e Melhores Práticas

### ✅ DO's (Faça)

1. **Use referências absolutas**
   - Bom: `B5`, `D10:D50`
   - Evite: `B` sem número (a não ser que queira coluna inteira)

2. **Teste fórmulas no Google Sheets primeiro**
   - Cole a fórmula direto na planilha
   - Veja se retorna o valor esperado
   - Depois copie para o sistema

3. **Nomeie bem as células na planilha**
   - Use cabeçalhos claros na linha 1
   - Facilita identificar depois

4. **Deixe cards vazios se não quiser importar**
   - Não precisa configurar todos os cards
   - Só configure os que você precisa

### ❌ DON'Ts (Evite)

1. **Não use fórmulas que referenciam outras abas**
   - Errado: `='Outra Aba'!A1`
   - Certo: `A1` (mesma aba configurada)

2. **Não use funções do Google Sheets avançadas**
   - A API pode não suportar
   - Use funções básicas: SUM, AVERAGE, COUNT, etc.

3. **Não configure célula errada**
   - Verifique 2x antes de salvar
   - Teste com "Sincronizar Agora" depois

---

## 🧪 Testando o Mapeamento

Depois de configurar:

1. Clique em **"Concluir Integração"**
2. No dropdown "Sheets", clique em **"Sincronizar Agora"**
3. Veja se os dados aparecem nos cards
4. Se algo estiver errado:
   - Vá em "Configurações" no dropdown
   - Ajuste os mapeamentos
   - Sincronize novamente

---

## 🆘 Solução de Problemas

### **Card mostra valor errado**
- Verifique se a célula/range está correto
- Teste a fórmula direto no Google Sheets
- Confira se a agregação está certa (soma vs média)

### **Card mostra vazio**
- Verifique se a planilha tem dados naquela célula
- Confira o nome da aba
- Veja se a sincronização teve sucesso

### **Erro ao salvar mapeamento**
- Execute o SQL de criação da tabela
- Verifique se o RLS está desabilitado
- Veja logs no console (F12)

---

## 📚 Referências Rápidas

### **Sintaxe de Células**
```
A1       → Célula A1
B5       → Célula B5
Z99      → Célula Z99
```

### **Sintaxe de Ranges**
```
A1:A10   → Células de A1 até A10
D10:D50  → Células de D10 até D50
B:B      → Coluna B inteira
A:Z      → Colunas A até Z inteiras
```

### **Fórmulas Comuns**
```
=SUM(A1:A10)              → Soma
=AVERAGE(B:B)             → Média
=COUNTA(C:C)              → Contagem (não vazios)
=(B5/C5)*100              → Porcentagem
=SUM(E:E)/COUNTA(A:A)     → Média ponderada
```

---

## 🎉 Pronto!

Agora você tem **controle total** sobre como os dados fluem da planilha para o dashboard!

**Próximos passos:**
1. ✅ Execute o SQL no Supabase
2. ✅ Execute os SQLs anteriores (colunas, RLS)
3. ✅ Limpe o cache do navegador
4. ✅ Teste a integração completa
5. ✅ Configure seus mapeamentos

**Qualquer dúvida, consulte este guia!** 📖
