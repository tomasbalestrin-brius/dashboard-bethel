import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users } from 'lucide-react';
import type { FunnelViewMode, FunnelSelectorOption } from '@/types/funnel';

interface FunnelSelectorProps {
  funnels: FunnelSelectorOption[];
  currentFunnelId: string | null;
  viewMode: FunnelViewMode;
  onFunnelChange: (funnelId: string | null) => void;
  onViewModeChange: (mode: FunnelViewMode) => void;
  loading?: boolean;
}

export function FunnelSelector({
  funnels,
  currentFunnelId,
  viewMode,
  onFunnelChange,
  onViewModeChange,
  loading = false,
}: FunnelSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* View Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={viewMode === 'individual' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('individual')}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Individual
        </Button>
        <Button
          variant={viewMode === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('overview')}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Visão Geral
        </Button>
      </div>

      {/* Funnel Selector (only shown in individual mode) */}
      {viewMode === 'individual' && (
        <div className="flex-1 w-full sm:w-auto min-w-[280px]">
          <Select
            value={currentFunnelId || undefined}
            onValueChange={onFunnelChange}
            disabled={loading || funnels.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um funil" />
            </SelectTrigger>
            <SelectContent>
              {funnels.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Nenhum funil disponível
                </div>
              ) : (
                funnels.map((funnel) => (
                  <SelectItem key={funnel.value} value={funnel.value}>
                    <div className="flex items-center gap-2">
                      <span>{funnel.label}</span>
                      {!funnel.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Funnel Count Badge */}
      {viewMode === 'overview' && funnels.length > 0 && (
        <Badge variant="outline" className="gap-2">
          <TrendingUp className="h-3 w-3" />
          {funnels.length} {funnels.length === 1 ? 'funil' : 'funis'}
        </Badge>
      )}
    </div>
  );
}

// Helper function to convert funnel objects to selector options
export function toFunnelOptions<T extends { id: string; name: string; is_active?: boolean }>(
  funnels: T[]
): FunnelSelectorOption[] {
  return funnels.map((funnel) => ({
    value: funnel.id,
    label: funnel.name,
    isActive: funnel.is_active !== false,
  }));
}
