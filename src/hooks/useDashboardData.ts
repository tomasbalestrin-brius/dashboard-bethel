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
      if (!month) return;

      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${month.gid}`;
      const response = await fetch(url);
      const csvText = await response.text();

      Papa.parse(csvText, {
        complete: function (results: any) {
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
              const row = results.data[i];
              if (!row) continue;
              const rowData = parseRow(row);
              semanas.push(rowData);
            }

            const tendenciaRow = results.data[range.tendencia];
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
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados. Tente novamente.', 'error');
      setLoading(false);
    }
  }, [currentMonth, showToast]);

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
