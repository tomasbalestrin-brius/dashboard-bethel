import { useInstallPrompt } from '@/hooks/usePWA';

export function InstallPrompt() {
  const { showInstallPrompt, handleInstall, dismissPrompt } = useInstallPrompt();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-fade-in-up">
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/90 to-pink-500/90 border border-purple-400/50 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={dismissPrompt}
          className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl">📊</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              Instalar Dashboard
            </h3>
            <p className="text-sm text-white/90 mb-4">
              Adicione à tela inicial para acesso rápido e use offline!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-6 py-2 bg-white text-purple-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={dismissPrompt}
                className="px-6 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
