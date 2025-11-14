import { useEffect } from 'react';
import { useOrganization } from './useOrganization';

export const useBranding = () => {
  const { organization } = useOrganization();

  useEffect(() => {
    if (organization) {
      applyBranding();
    }
  }, [organization]);

  const applyBranding = () => {
    if (!organization) return;

    // Aplicar cores customizadas
    const root = document.documentElement;
    
    // Converter hex para HSL
    const hexToHSL = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return null;
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Aplicar cor primária
    if (organization.primary_color) {
      const primaryHSL = hexToHSL(organization.primary_color);
      if (primaryHSL) {
        root.style.setProperty('--primary', primaryHSL);
      }
    }

    // Aplicar cor secundária
    if (organization.secondary_color) {
      const secondaryHSL = hexToHSL(organization.secondary_color);
      if (secondaryHSL) {
        root.style.setProperty('--secondary', secondaryHSL);
      }
    }

    // Aplicar favicon
    if (organization.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = organization.favicon_url;
      }
    }

    // Aplicar título
    document.title = `${organization.name} - Dashboard Analytics`;
  };

  return { organization };
};
