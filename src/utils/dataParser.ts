import type { WeekData } from '@/types/dashboard';

export function parseRow(row: any[]): WeekData {
  const parseNumber = (val: any): number => {
    if (val === null || val === undefined || val === '') return 0;
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.-]/g, '')) : Number(val);
    return isNaN(num) ? 0 : num;
  };

  const alunos = parseNumber(row[1]);
  const qualificados = parseNumber(row[2]);
  const agendados = parseNumber(row[3]);
  const callRealizada = parseNumber(row[4]);
  const numeroVenda = parseNumber(row[5]);
  const investido = parseNumber(row[6]);
  const faturamentoTrafego = parseNumber(row[7]);
  const faturamentoFunil = parseNumber(row[8]);
  const roasTrafego = parseNumber(row[9]);
  const roasFunil = parseNumber(row[10]);
  const vendaMonetizacao = parseNumber(row[11]);
  const entradas = parseNumber(row[12]);
  let lucroFunil = parseNumber(row[13]);
  
  const taxaConversao = alunos > 0 ? (numeroVenda / alunos) * 100 : 0;

  // Se lucroFunil não está na planilha (0), calcular
  if (lucroFunil === 0 && faturamentoFunil > 0) {
    lucroFunil = faturamentoFunil - investido;
  }

  return {
    alunos,
    qualificados,
    agendados,
    callRealizada,
    numeroVenda,
    investido,
    faturamentoTrafego,
    faturamentoFunil,
    roasTrafego,
    roasFunil,
    vendaMonetizacao,
    entradas,
    lucroFunil,
    taxaConversao,
  };
}

export function calculateTotals(semanas: WeekData[]) {
  return {
    alunos: semanas.reduce((sum, s) => sum + s.alunos, 0),
    qualificados: semanas.reduce((sum, s) => sum + s.qualificados, 0),
    agendados: semanas.reduce((sum, s) => sum + s.agendados, 0),
    callRealizada: semanas.reduce((sum, s) => sum + s.callRealizada, 0),
    vendas: semanas.reduce((sum, s) => sum + s.numeroVenda, 0),
    investido: semanas.reduce((sum, s) => sum + s.investido, 0),
    faturado: semanas.reduce((sum, s) => sum + s.faturamentoTrafego, 0),
    faturamentoFunil: semanas.reduce((sum, s) => sum + s.faturamentoFunil, 0),
    lucroFunil: semanas.reduce((sum, s) => sum + s.lucroFunil, 0),
    vendaMonetizacao: semanas.reduce((sum, s) => sum + s.vendaMonetizacao, 0),
    entradas: semanas.reduce((sum, s) => sum + s.entradas, 0),
  };
}
