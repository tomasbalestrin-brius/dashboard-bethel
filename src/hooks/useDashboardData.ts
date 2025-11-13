import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import type { AllData, Month, Product, ModuleName, ThemeName, Toast } from '@/types/dashboard';
import { parseRow } from '@/utils/dataParser';

const SHEET_ID = '1V0-yWzGbDWUEQ21CPtNcHrzPQfLTXKHNBYUlSfzO2Pc';

export const MONTHS: Month[] = [
  { id: 'out', name: 'Outubro', gid: '0', startDate: '2024-10-01', endDate: '2024-10-31' },
  { id: 'nov', name: 'Novembro', gid: '799831430', startDate: '2024-11-01', endDate: '2024-11-30' },
  { id: 'dez', name: 'Dezembro', gid: '1796217875', startDate: '2024-12-01', endDate: '2024-12-31' },
  { id: 'jan', name: 'Janeiro', gid: '1107738440', startDate: '2025-01-01', endDate: '2025-01-31' },
  { id: 'fev', name: 'Fevereiro', gid: '668056747', startDate: '2025-02-01', endDate: '2025-02-28' },
];

export const ALL_PRODUCTS: Product[] = [
  { id: 'Geral', name: 'Geral', icon: '📊', team: 'geral' },
  { id: '50 Scripts', name: '50 Scripts', icon: '📝', team: 'cleiton' },
  { id: 'Couply', name: 'Couply', icon: '💑', team: 'cleiton' },
  { id: 'Social Selling CL', name: 'Social Selling CL', icon: '📱', team: 'cleiton' },
  { id: 'Teste', name: 'Teste', icon: '🧪', team: 'julia' },
  { id: 'IA Julia', name: 'IA Julia', icon: '🤖', team: 'julia' },
  { id: 'MPM', name: 'MPM', icon: '📈', team: 'julia' },
  { id: 'Autentiq', name: 'Autentiq', icon: '🔐', team: 'julia' },
  { id: 'Mentoria Julia', name: 'Mentoria Julia', icon: '👩‍🏫', team: 'julia' },
  { id: 'Social Selling JU', name: 'Social Selling JU', icon: '💼', team: 'julia' },
];

export function getCurrentMonth(): string {
  const today = new Date();
  
  for (let month of MONTHS) {
    const startDate = new Date(month.startDate);
    const endDate = new Date(month.endDate);
    
    if (today >= startDate && today <= endDate) {
      return month.id;
    }
  }
  
  return MONTHS[MONTHS.length - 1].id;
}

export function useDashboardData() {
  const [allData, setAllData] = useState<AllData>({});
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth());
  const [currentTeam, setCurrentTeam] = useState<'geral' | 'cleiton' | 'julia'>('geral');
  const [currentProduct, setCurrentProduct] = useState<string>('Geral');
  const [currentWeek, setCurrentWeek] = useState<string>('total');
  const [currentModule, setCurrentModule] = useState<ModuleName>('dashboard');
  const [theme, setTheme] = useState<ThemeName>('light');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboardTheme') as ThemeName;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const changeTheme = useCallback((newTheme: ThemeName) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dashboardTheme', newTheme);
  }, []);

  // Toast management
  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Data loading
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const month = MONTHS.find(m => m.id === currentMonth);
      if (!month) {
        console.error('❌ Mês não encontrado:', currentMonth);
        setLoading(false);
        return;
      }

      // Verificar cache primeiro (5 minutos)
      const cacheKey = `dashboard_cache_${currentMonth}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;
          const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
          
          if (cacheAge < CACHE_DURATION) {
            console.log('📦 Usando dados do cache (idade:', Math.round(cacheAge / 1000), 'segundos)');
            parseAndSetData(cachedData);
            setLoading(false);
            showToast('Dados carregados do cache', 'success', 2000);
            return;
          }
        } catch (e) {
          console.warn('⚠️ Cache inválido, buscando dados novos');
        }
      }

      // Buscar dados via Edge Function (que tem acesso à service account)
      console.log('🔄 Buscando dados da API via Edge Function...');
      console.log('📋 Mês:', month.name, '| Range: A1:Q100');
      
      // Usar o nome da aba concatenado com o range no formato: NomeAba!A1:Q100
      const fullRange = `${month.name}!A1:Q100`;
      
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-sheets-data`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: fullRange
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta da edge function:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📥 Resposta da edge function:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar dados');
      }

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Formato de dados inválido recebido da API');
      }

      console.log(`✅ Dados recebidos: ${result.data.length} linhas`);

      // Salvar em cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result.data,
        timestamp: Date.now()
      }));

      parseAndSetData(result.data);
      setLoading(false);
      showToast('Dados carregados com sucesso!', 'success', 2000);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados';
      showToast(errorMessage, 'error', 5000);
      setLoading(false);
    }
  }, [currentMonth, showToast]);

  // Função auxiliar para processar dados
  const parseAndSetData = useCallback((data: any[][]) => {
    const newData: AllData = {};
    const productRanges: Record<string, { start: number; end: number; tendencia: number }> = {
      'Geral': { start: 1, end: 4, tendencia: 5 },
      '50 Scripts': { start: 22, end: 25, tendencia: 26 },
      'Teste': { start: 29, end: 32, tendencia: 33 },
      'IA Julia': { start: 36, end: 39, tendencia: 40 },
      'MPM': { start: 43, end: 45, tendencia: 46 },
      'Couply': { start: 8, end: 11, tendencia: 12 },
      'Autentiq': { start: 15, end: 18, tendencia: 19 },
      'Mentoria Julia': { start: 50, end: 53, tendencia: 54 },
      'Social Selling CL': { start: 57, end: 60, tendencia: 61 },
      'Social Selling JU': { start: 64, end: 67, tendencia: 68 },
    };

    for (const [productName, range] of Object.entries(productRanges)) {
      const semanas = [];
      for (let i = range.start; i <= range.end; i++) {
        const row = data[i];
        if (!row) continue;
        const rowData = parseRow(row);
        semanas.push(rowData);
      }

      const tendenciaRow = data[range.tendencia];
      let tendencia = null;
      if (tendenciaRow) {
        tendencia = parseRow(tendenciaRow);
        if (tendencia.lucroFunil === 0 && tendencia.faturamentoFunil > 0) {
          tendencia.lucroFunil = tendencia.faturamentoFunil - tendencia.investido;
        }
      }

      newData[productName] = { semanas, tendencia };
    }

    setAllData(newData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectMonth = useCallback((monthId: string) => {
    setCurrentMonth(monthId);
    const monthName = MONTHS.find(m => m.id === monthId)?.name || monthId;
    const isActualCurrent = monthId === getCurrentMonth();
    showToast(`${isActualCurrent ? '📅 Mês Atual: ' : '📂 Visualizando: '}${monthName}`, 'info', 2000);
  }, [showToast]);

  const selectTeam = useCallback((team: 'geral' | 'cleiton' | 'julia') => {
    setCurrentTeam(team);
    
    if (team === 'geral') {
      setCurrentProduct('Geral');
    } else if (team === 'cleiton') {
      setCurrentProduct('50 Scripts');
    } else if (team === 'julia') {
      setCurrentProduct('IA Julia');
    }
    
    const teamNames = {
      'geral': 'Geral',
      'cleiton': 'Time Cleiton',
      'julia': 'Time Julia'
    };
    
    showToast(`Visualizando ${teamNames[team]} ✨`, 'success', 2000);
  }, [showToast]);

  const selectProduct = useCallback((productId: string) => {
    setCurrentProduct(productId);
    const product = ALL_PRODUCTS.find(p => p.id === productId);
    if (product) {
      showToast(`${product.icon} ${product.name} selecionado`, 'success', 2000);
    }
  }, [showToast]);

  const selectModule = useCallback((moduleName: ModuleName) => {
    setCurrentModule(moduleName);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    allData,
    currentMonth,
    currentTeam,
    currentProduct,
    currentWeek,
    currentModule,
    theme,
    loading,
    mobileMenuOpen,
    toasts,
    selectMonth,
    selectTeam,
    selectProduct,
    setCurrentWeek,
    selectModule,
    changeTheme,
    showToast,
    removeToast,
    setMobileMenuOpen,
  };
}
