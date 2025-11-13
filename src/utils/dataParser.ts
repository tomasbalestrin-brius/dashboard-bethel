import type { WeekData } from '@/types/dashboard';

// Parse value tratando erros do Excel e formatação brasileira
export function parseValue(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  
  // Tratar erros do Excel
  if (typeof val === 'string') {
    const upperVal = val.toUpperCase();
    if (upperVal.includes('#N/A') || upperVal.includes('#DIV/0!') || 
        upperVal.includes('#NUM!') || upperVal.includes('#VALOR!') ||
        upperVal.includes('#REF!') || upperVal.includes('#NOME?')) {
      return 0;
    }
    
    // Remover caracteres não numéricos exceto vírgula e ponto
    let cleaned = val.replace(/[^\d,.-]/g, '');
    
    // Remover pontos de milhar (assumindo formato brasileiro: 1.234,56)
    cleaned = cleaned.replace(/\./g, '');
    
    // Substituir vírgula decimal por ponto
    cleaned = cleaned.replace(',', '.');
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

export function parseRow(row: any[]): WeekData {
  // Mapear colunas conforme estrutura da planilha
  const investido = parseValue(row[1]);           // Coluna B
  const faturamentoTrafego = parseValue(row[2]);  // Coluna C
  const roasTrafego = parseValue(row[3]);         // Coluna D
  const alunos = parseValue(row[4]);              // Coluna E
  const qualificados = parseValue(row[5]);        // Coluna F
  const agendados = parseValue(row[6]);           // Coluna G
  const taxaAgendamento = parseValue(row[7]);     // Coluna H
  const callRealizada = parseValue(row[8]);       // Coluna I
  const taxaComparecimento = parseValue(row[9]);  // Coluna J
  const numeroVenda = parseValue(row[10]);        // Coluna K
  const taxaConversao = parseValue(row[11]);      // Coluna L
  const taxaAscensao = parseValue(row[12]);       // Coluna M
  const vendaMonetizacao = parseValue(row[13]);   // Coluna N
  const entradas = parseValue(row[14]);           // Coluna O
  const faturamentoFunil = parseValue(row[15]);   // Coluna P
  const lucroFunil = parseValue(row[16]);         // Coluna Q
  
  const roasFunil = investido > 0 ? (faturamentoFunil / investido) : 0;

  return {
    alunos,
    qualificados,
    agendados,
    taxaAgendamento,
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
