import { useState } from 'react';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

export function UpdateNotification({ onUpdate }: UpdateNotificationProps) {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-fade-in-up">
      <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/90 to-cyan-500/90 border border-blue-400/50 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔄</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-1">
              Atualização Disponível
            </h3>
            <p className="text-xs text-white/90 mb-3">
              Uma nova versão do dashboard está disponível.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onUpdate();
                  setShow(false);
                }}
                className="px-4 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors"
              >
                Atualizar Agora
              </button>
              <button
                onClick={() => setShow(false)}
                className="px-4 py-1.5 bg-white/20 text-white rounded-lg text-xs font-medium hover:bg-white/30 transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
