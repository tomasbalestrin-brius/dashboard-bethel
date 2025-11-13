import { useState, useRef, useEffect } from 'react';

interface ProductGroupNavigationProps {
  selectedProduct: string;
  onSelectProduct: (productName: string) => void;
  availableProducts: string[];
}

export function ProductGroupNavigation({
  selectedProduct,
  onSelectProduct,
  availableProducts
}: ProductGroupNavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const groups = [
    {
      id: 'geral',
      name: 'Geral',
      icon: '🎯',
      color: 'from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))]',
      total: 'Geral',
      items: []
    },
    {
      id: 'cleiton',
      name: 'Cleiton',
      icon: '👨‍💼',
      color: 'from-blue-500 to-cyan-500',
      total: 'Total Cleiton',
      items: ['50 Scripts', 'Couply', 'Social Selling CL']
    },
    {
      id: 'julia',
      name: 'Julia',
      icon: '👩‍💼',
      color: 'from-pink-500 to-rose-500',
      total: 'Total Julia',
      items: ['Teste', 'MPM', 'IA Julia', 'Autentiq', 'Mentoria Ju', 'Social Selling Ju']
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isProductAvailable = (productName: string) => {
    return availableProducts.some(p => 
      p.toLowerCase().includes(productName.toLowerCase()) ||
      productName.toLowerCase().includes(p.toLowerCase())
    );
  };

  const getActiveGroup = () => {
    for (const group of groups) {
      if (selectedProduct === group.total || selectedProduct === group.name) return group.id;
      if (group.items.some(item => 
        selectedProduct.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(selectedProduct.toLowerCase())
      )) {
        return group.id;
      }
    }
    return 'geral';
  };

  const activeGroup = getActiveGroup();

  return (
    <div className="flex flex-wrap gap-3 mb-6" ref={dropdownRef}>
      {groups.map((group) => {
        const isActive = activeGroup === group.id;
        const hasItems = group.items.length > 0;
        const isOpen = openDropdown === group.id;

        return (
          <div key={group.id} className="relative">
            <button
              onClick={() => {
                if (hasItems) {
                  setOpenDropdown(isOpen ? null : group.id);
                } else {
                  onSelectProduct(group.total);
                  setOpenDropdown(null);
                }
              }}
              className={`
                px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2
                ${isActive
                  ? `bg-gradient-to-r ${group.color} text-white shadow-lg scale-105`
                  : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-secondary))]'
                }
              `}
            >
              <span className="text-xl">{group.icon}</span>
              <span>{group.name}</span>
              {hasItems && (
                <span className={`text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              )}
            </button>

            {hasItems && isOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 backdrop-blur-xl bg-[hsl(var(--bg-secondary))]/95 border border-[hsl(var(--border-color))]/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <button
                  onClick={() => {
                    onSelectProduct(group.total);
                    setOpenDropdown(null);
                  }}
                  className={`
                    w-full px-4 py-3 text-left transition-colors flex items-center gap-3
                    ${selectedProduct === group.total
                      ? `bg-gradient-to-r ${group.color} text-white`
                      : 'text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                    }
                  `}
                >
                  <span className="text-xl">📊</span>
                  <div className="flex-1">
                    <p className="font-semibold">{group.total}</p>
                    <p className="text-xs opacity-70">Visão consolidada</p>
                  </div>
                  {selectedProduct === group.total && (
                    <span className="text-sm">✓</span>
                  )}
                </button>

                <div className="border-t border-[hsl(var(--border-color))]/50"></div>

                <div className="py-2">
                  {group.items.map((item) => {
                    const isAvailable = isProductAvailable(item);
                    const isSelected = selectedProduct.toLowerCase().includes(item.toLowerCase()) ||
                                     item.toLowerCase().includes(selectedProduct.toLowerCase());

                    return (
                      <button
                        key={item}
                        onClick={() => {
                          if (isAvailable) {
                            onSelectProduct(item);
                            setOpenDropdown(null);
                          }
                        }}
                        disabled={!isAvailable}
                        className={`
                          w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2
                          ${isSelected
                            ? 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] font-medium'
                            : isAvailable
                              ? 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]'
                              : 'text-[hsl(var(--text-secondary))]/50 cursor-not-allowed'
                          }
                        `}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        <span className="flex-1">{item}</span>
                        {isSelected && <span className="text-xs">✓</span>}
                        {!isAvailable && <span className="text-xs opacity-50">N/D</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
