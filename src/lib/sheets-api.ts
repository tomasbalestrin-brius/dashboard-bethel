// src/lib/sheets-api.ts
// Fetch DIRETO da Google Sheets API (SEM Edge Functions!)

const SPREADSHEET_ID = '1XsdWQNR7FUo4TrrhsMjSGESS3PtS9G7X8FoHHStxLtU';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

const SHEET_NAMES: Record<string, string> = {
  'Outubro': 'Dados de Out/25',
  'Novembro': 'Dados de Nov/25',
  'Dezembro': 'Dados de Dez/25',
  'Janeiro': 'Dados de Jan/26'
};

export interface WeekData {
  investido: number;
  faturamentoTrafego: number;
  roasTrafego: number;
  alunos: number;
  qualificados: number;
  agendados: number;
  taxaAgendamento: number;
  callRealizada: number;
  taxaComparecimento: number;
  numeroVenda: number;
  taxaConversao: number;
  taxaAscensao: number;
  vendaMonetizacao: number;
  entradas: number;
  faturamentoFunil: number;
  lucroFunil: number;
  roasFunil: number;
}

export interface ProductData {
  name: string;
  weeks: WeekData[];
  tendencia: WeekData | null;
}

function parseValue(val: any): number {
  if (!val || val === '#N/A' || val === '#DIV/0!' || val === '' || val === '#NUM!' || val === '-') {
    return 0;
  }
  
  let cleanVal = val.toString().replace(/[^\d,.-]/g, '');
  cleanVal = cleanVal.replace(/\./g, ''); // Remove pontos de milhar
  cleanVal = cleanVal.replace(',', '.'); // Substitui vírgula por ponto
  
  return parseFloat(cleanVal) || 0;
}

function parseRow(row: any[]): WeekData {
  const investido = parseValue(row[2]);
  const faturamentoFunil = parseValue(row[16]);
  const roasFunil = investido > 0 ? (faturamentoFunil / investido) : 0;
  
  return {
    investido,                               // Coluna C
    faturamentoTrafego: parseValue(row[3]),  // Coluna D
    roasTrafego: parseValue(row[4]),         // Coluna E
    alunos: parseValue(row[5]),              // Coluna F
    qualificados: parseValue(row[6]),        // Coluna G
    agendados: parseValue(row[7]),           // Coluna H
    taxaAgendamento: parseValue(row[8]),     // Coluna I
    callRealizada: parseValue(row[9]),       // Coluna J
    taxaComparecimento: parseValue(row[10]), // Coluna K
    numeroVenda: parseValue(row[11]),        // Coluna L
    taxaConversao: parseValue(row[12]),      // Coluna M
    taxaAscensao: parseValue(row[13]),       // Coluna N
    vendaMonetizacao: parseValue(row[14]),   // Coluna O
    entradas: parseValue(row[15]),           // Coluna P
    faturamentoFunil,                        // Coluna Q
    lucroFunil: parseValue(row[17]),         // Coluna R
    roasFunil                                // Calculado
  };
}

function parseSheetData(rows: any[][]): ProductData[] {
  const products: ProductData[] = [];
  
  // Começar da linha 1 (índice 1), pulando o header (índice 0)
  let i = 1;
  
  while (i < rows.length) {
    const row = rows[i];
    
    // Verificar se tem nome do funil na coluna A
    if (!row[0]) {
      i++;
      continue;
    }
    
    const productName = row[0].toString().trim();
    const weeks: WeekData[] = [];
    let tendencia: WeekData | null = null;
    
    console.log(`📦 Processando produto: ${productName} (linha ${i + 1})`);
    
    // Ler as próximas 5 linhas (4 semanas + 1 tendência)
    for (let j = 0; j < 5 && (i + j) < rows.length; j++) {
      const currentRow = rows[i + j];
      const periodo = currentRow[1]?.toString().toLowerCase() || '';
      
      // Verificar se é tendência
      if (periodo.includes('tendência') || periodo.includes('tendencia')) {
        tendencia = parseRow(currentRow);
        console.log(`  📈 Tendência encontrada (linha ${i + j + 1})`);
      } else if (periodo.includes('semana')) {
        const weekData = parseRow(currentRow);
        weeks.push(weekData);
        console.log(`  📅 ${currentRow[1]} (linha ${i + j + 1})`);
      }
    }
    
    // Adicionar produto se tiver pelo menos 1 semana
    if (weeks.length > 0) {
      products.push({
        name: productName,
        weeks,
        tendencia
      });
      console.log(`  ✅ ${productName}: ${weeks.length} semanas processadas`);
    }
    
    // Avançar 5 linhas (bloco completo)
    i += 5;
  }
  
  console.log(`✅ Total de produtos processados: ${products.length}`);
  return products;
}

export async function fetchSheetData(month: string): Promise<ProductData[]> {
  console.log('🔄 Buscando dados DIRETAMENTE da Google Sheets API');
  console.log('📅 Mês:', month);
  
  if (!API_KEY) {
    throw new Error('VITE_GOOGLE_SHEETS_API_KEY não configurada!');
  }
  
  const sheetName = SHEET_NAMES[month];
  if (!sheetName) {
    throw new Error(`Mês inválido: ${month}. Use: ${Object.keys(SHEET_NAMES).join(', ')}`);
  }
  
  const range = `${sheetName}!A1:R200`;
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodedRange}?key=${API_KEY}`;
  
  console.log('📋 Aba:', sheetName);
  console.log('📍 Range:', range);
  console.log('🔗 URL:', url.replace(API_KEY, 'API_KEY_OCULTA'));
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('📡 Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Dados recebidos:', data.values?.length, 'linhas');

    if (!data.values || !Array.isArray(data.values)) {
      throw new Error('Formato de dados inválido da API');
    }

    const parsed = parseSheetData(data.values);
    console.log('✅ Dados parseados:', parsed.length, 'produtos');
    
    return parsed;
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
    throw error;
  }
}
