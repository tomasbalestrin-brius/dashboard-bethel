import { ALL_PRODUCTS } from '@/hooks/useDashboardData';
import type { Product } from '@/types/dashboard';

interface ProductSelectorProps {
  currentTeam: 'geral' | 'cleiton' | 'julia';
  currentProduct: string;
  onProductSelect: (productId: string) => void;
}

export function ProductSelector({ currentTeam, currentProduct, onProductSelect }: ProductSelectorProps) {
  if (currentTeam === 'geral') {
    return null;
  }

  const teamProducts = ALL_PRODUCTS.filter(p => p.team === currentTeam);

  return (
    <div className="flex justify-center gap-[18px] mb-[35px] flex-wrap max-md:gap-2">
      {teamProducts.map(product => (
        <button
          key={product.id}
          onClick={() => onProductSelect(product.id)}
          className={`
            py-[18px] px-[38px] border-none rounded-[14px] text-[1.15rem] font-bold cursor-pointer transition-all duration-300 bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]
            hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)]
            max-md:py-3 max-md:px-[18px] max-md:text-sm max-md:flex-[1_1_calc(50%-8px)] max-md:min-w-[140px]
            max-[480px]:py-2.5 max-[480px]:px-3.5 max-[480px]:text-[0.85rem]
            ${currentProduct === product.id ? 'bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] text-white -translate-y-[3px] shadow-[0_10px_30px_rgba(59,130,246,0.4)]' : ''}
          `}
        >
          {product.icon} {product.name}
        </button>
      ))}
    </div>
  );
}
