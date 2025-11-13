// src/lib/sheets-api.ts
// Fetch DIRETO da Google Sheets API (SEM Edge Functions!)

const SPREADSHEET_ID = '1V0-yWzGbDWUEQ21CPtNcHrzPQfLTXKHNBYUlSfzO2Pc';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

const SHEET_NAMES: Record<string, string> = {
  'Outubro': 'Dados de Out/25',
  'Novembro': 'Dados de Nov/25',
  'Dezembro': 'Dados de Dez/25',
  'Janeiro': 'Dados de Jan/26'
};

export interface WeekData {
  alunos: number;
  qualificados: number;
  agendados: number;
  callRealizada: number;
  numeroVenda: number;
  investido: number;
  faturamentoTrafego: number;
  faturamentoFunil: number;
  roasTrafego: number;
  roasFunil: number;
  vendaMonetizacao: number;
  entradas: number;
  lucroFunil: number;
  taxaConversao: number;
  taxaAgendamento: number;
  taxaComparecimento: number;
  taxaAscensao: number;
}

export interface ProductData {
  name: string;
  weeks: WeekData[];
  tendencia: WeekData | null;
}

function parseValue(val: any): number {
  if (!val || val === '#N/A' || val === '#DIV/0!' || val === '' || val === '#NUM!') {
    return 0;
  }
  
  let cleanVal = val.toString().replace(/[^\d,.-]/g, '');
  cleanVal = cleanVal.replace(/\./g, '');
  cleanVal = cleanVal.replace(',', '.');
  
  return parseFloat(cleanVal) || 0;
}

function parseRow(row: any[]): WeekData {
  const investido = parseValue(row[1]);
  const faturamentoTrafego = parseValue(row[2]);
  const faturamentoFunil = parseValue(row[15]);
  
  const roasTrafego = parseValue(row[3]);
  const roasFunil = investido > 0 ? (faturamentoFunil / investido) : 0;
  
  return {
    investido,
    faturamentoTrafego,
    roasTrafego,
    alunos: parseValue(row[4]),
    qualificados: parseValue(row[5]),
    agendados: parseValue(row[6]),
    taxaAgendamento: parseValue(row[7]),
    callRealizada: parseValue(row[8]),
    taxaComparecimento: parseValue(row[9]),
    numeroVenda: parseValue(row[10]),
    taxaConversao: parseValue(row[11]),
    taxaAscensao: parseValue(row[12]),
    vendaMonetizacao: parseValue(row[13]),
    entradas: parseValue(row[14]),
    faturamentoFunil,
    lucroFunil: parseValue(row[16]),
    roasFunil
  };
}

function parseSheetData(rows: any[][]): ProductData[] {
  const productRanges = {
    'Geral': { start: 1, end: 4, tendencia: 5 },
    'Couply': { start: 8, end: 11, tendencia: 12 },
    '50 Scripts': { start: 22, end: 25, tendencia: 26 },
    'Teste': { start: 29, end: 32, tendencia: 33 },
    'IA Julia': { start: 36, end: 39, tendencia: 40 },
    'MPM': { start: 43, end: 45, tendencia: 46 }
  };

  return Object.entries(productRanges).map(([name, range]) => {
    const weeks: WeekData[] = [];
    
    for (let i = range.start; i <= range.end; i++) {
      if (rows[i]) {
        weeks.push(parseRow(rows[i]));
      }
    }
    
    const tendencia = rows[range.tendencia] ? parseRow(rows[range.tendencia]) : null;
    
    return {
      name,
      weeks,
      tendencia
    };
  });
}

export async function fetchSheetData(month: string): Promise<ProductData[]> {
  console.log('🔄 Buscando dados DIRETAMENTE da Google Sheets API (SEM Edge Functions)');
  console.log('📅 Mês:', month);
  
  if (!API_KEY) {
    throw new Error('VITE_GOOGLE_SHEETS_API_KEY não configurada!');
  }
  
  const sheetName = SHEET_NAMES[month];
  if (!sheetName) {
    throw new Error(`Mês inválido: ${month}. Use: ${Object.keys(SHEET_NAMES).join(', ')}`);
  }
  
  const range = `${sheetName}!A1:Q100`;
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
