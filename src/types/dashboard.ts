export interface Month {
  id: string;
  name: string;
  gid: string;
  startDate: string;
  endDate: string;
}

export interface Product {
  id: string;
  name: string;
  icon: string;
  team: 'geral' | 'cleiton' | 'julia';
}

export interface WeekData {
  alunos: number;
  qualificados: number;
  agendados: number;
  taxaAgendamento: number;
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
}

export interface ProductData {
  semanas: WeekData[];
  tendencia: WeekData | null;
}

export interface AllData {
  [productId: string]: ProductData;
}

export interface FunnelData {
  alunos: number;
  qualificados: number;
  agendados: number;
  callRealizada: number;
  vendas: number;
}

export type ModuleName =
  | 'dashboard'
  | 'resumo'
  | 'comparar-funis'
  | 'comparacao'
  | 'roi'
  | 'custos'
  | 'insights'
  | 'exportar';

export type ThemeName = 'dark' | 'light' | 'blue' | 'green' | 'purple';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
