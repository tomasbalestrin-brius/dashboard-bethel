import { useState, useEffect, useCallback } from 'react';
import type { AllData, Month, Product, ModuleName, ThemeName, Toast } from '@/types/dashboard';
import { fetchSheetData } from '@/lib/sheets-api';

const SHEET_ID = '1V0-yWzGbDWUEQ21CPtNcHrzPQfLTXKHNBYUlSfzO2Pc';

// Mapeamento de nomes de exibição para nomes reais das abas
const SHEET_NAMES: Record<string, string> = {
  'Outubro': 'Dados de Out/25',
  'Novembro': 'Dados de Nov/25',
  'Dezembro': 'Dados de Dez/25',
  'Janeiro': 'Dados de Jan/26',
};

export const MONTHS: Month[] = [
  { id: 'out', name: 'Outubro', gid: '0', startDate: '2024-10-01', endDate: '2024-10-31' },
  { id: 'nov', name: 'Novembro', gid: '799831430', startDate: '2024-11-01', endDate: '2024-11-30' },
  { id: 'dez', name: 'Dezembro', gid: '1796217875', startDate: '2024-12-01', endDate: '2024-12-31' },
  { id: 'jan', name: 'Janeiro', gid: '1107738440', startDate: '2025-01-01', endDate: '2025-01-31' },
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
            
            // Converter ProductData[] para AllData
            const newData: AllData = {};
            cachedData.forEach((product: any) => {
              newData[product.name] = {
                semanas: product.weeks,
                tendencia: product.tendencia
              };
            });
            
            setAllData(newData);
            setLoading(false);
            showToast('Dados carregados do cache', 'success', 2000);
            return;
          }
        } catch (e) {
          console.warn('⚠️ Cache inválido, buscando dados novos');
        }
      }

      // Buscar dados DIRETAMENTE da Google Sheets API (SEM Edge Functions!)
      console.log('🎯 Iniciando busca de dados para:', month.name);
      
      const productsData = await fetchSheetData(month.name);
      
      console.log(`✅ Dados recebidos com sucesso! ${productsData.length} produtos`);

      // Salvar em cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: productsData,
        timestamp: Date.now()
      }));

      // Converter ProductData[] para AllData
      const newData: AllData = {};
      productsData.forEach(product => {
        newData[product.name] = {
          semanas: product.weeks,
          tendencia: product.tendencia
        };
      });

      setAllData(newData);
      setLoading(false);
      showToast('Dados carregados com sucesso!', 'success', 2000);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados';
      showToast(errorMessage, 'error', 5000);
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
