import { useState, useEffect, useRef } from 'react';
import type { ThemeName } from '@/types/dashboard';

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes: Array<{ id: ThemeName; label: string }> = [
    { id: 'dark', label: '🌙 Dark Mode' },
    { id: 'light', label: '☀️ Light Mode' },
    { id: 'blue', label: '🔵 Ocean Blue' },
    { id: 'green', label: '🟢 Forest Green' },
    { id: 'purple', label: '🟣 Royal Purple' },
  ];

  return (
    <div className="fixed top-[30px] right-[30px] z-[9999] max-md:top-2.5 max-md:right-[70px]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[60px] h-[60px] rounded-full border-[3px] border-[hsl(var(--border-color))] bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] text-[1.8rem] cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center hover:scale-110 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] max-md:w-[50px] max-md:h-[50px] max-md:text-2xl"
        title="Trocar Tema"
      >
        🎨
      </button>
      
      {isOpen && (
        <div className="absolute top-[70px] right-0 bg-[hsl(var(--bg-secondary))] border-2 border-[hsl(var(--border-color))] rounded-2xl p-[15px] flex flex-col gap-2.5 min-w-[200px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-2 duration-300 max-md:right-[-10px]">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                setIsOpen(false);
              }}
              className={`
                p-3 px-4 rounded-lg border-2 border-[hsl(var(--border-color))] bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] cursor-pointer transition-all duration-300 flex items-center gap-2.5 font-semibold hover:translate-x-1 hover:border-[hsl(var(--accent-primary))]
                ${currentTheme === theme.id ? 'bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] border-[hsl(var(--accent-primary))] text-white' : ''}
              `}
            >
              {theme.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
