import { useDashboardData } from '@/hooks/useDashboardData';
import { ThemeSelector } from '@/components/dashboard/ThemeSelector';
import { MobileHeader } from '@/components/dashboard/MobileHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { ToastContainer } from '@/components/dashboard/Toast';
import { DashboardModule } from '@/components/dashboard/modules/Dashboard';
import { ResumoModule } from '@/components/dashboard/modules/Resumo';
import { ROIModule } from '@/components/dashboard/modules/ROI';
import { CustosModule } from '@/components/dashboard/modules/Custos';
import { InsightsModule } from '@/components/dashboard/modules/Insights';
import { CompararFunisModule } from '@/components/dashboard/modules/CompararFunis';
import { ExportarModule } from '@/components/dashboard/modules/Exportar';
import { ComparacaoModule } from '@/components/dashboard/modules/OtherModules';

const Index = () => {
  const {
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
    removeToast,
    setMobileMenuOpen,
  } = useDashboardData();

  return (
    <div className="min-h-screen p-[30px] px-5 max-md:pt-[60px] max-md:pb-[70px] max-md:px-2.5">
      <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
      <MobileHeader currentModule={currentModule} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      {mobileMenuOpen && (
        <div
          className="hidden max-md:block fixed inset-0 bg-black/70 z-[999] opacity-100 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar
        currentModule={currentModule}
        onModuleChange={selectModule}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      
      <BottomNav currentModule={currentModule} onModuleChange={selectModule} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="ml-[100px] max-w-[1800px] mx-auto max-md:ml-0">
        {loading ? (
          <div className="text-center p-20 text-[hsl(var(--text-secondary))]">
            <div className="text-5xl mb-4">⏳</div>
            <div className="text-xl">Carregando dados...</div>
          </div>
        ) : (
          <>
            {currentModule === 'dashboard' && (
              <DashboardModule
                allData={allData}
                currentMonth={currentMonth}
                currentTeam={currentTeam}
                currentProduct={currentProduct}
                currentWeek={currentWeek}
                onMonthSelect={selectMonth}
                onTeamSelect={selectTeam}
                onProductSelect={selectProduct}
                onWeekChange={setCurrentWeek}
              />
            )}
            {currentModule === 'resumo' && (
              <ResumoModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />
            )}
            {currentModule === 'roi' && <ROIModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
            {currentModule === 'custos' && <CustosModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
            {currentModule === 'insights' && <InsightsModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
            {currentModule === 'comparar-funis' && <CompararFunisModule allData={allData} currentMonth={currentMonth} onMonthSelect={selectMonth} />}
            {currentModule === 'comparacao' && <ComparacaoModule />}
            {currentModule === 'exportar' && <ExportarModule />}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
