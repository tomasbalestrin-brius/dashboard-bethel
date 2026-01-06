import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CardFieldMapping, ModuleCard, AggregationType, DataFormat } from '@/types/googleSheets';
import { Target, TrendingUp } from 'lucide-react';

interface CardFieldMappingConfigProps {
  card: ModuleCard;
  mapping: Partial<CardFieldMapping> | null;
  onChange: (mapping: CardFieldMapping) => void;
}

export function CardFieldMappingConfig({ card, mapping, onChange }: CardFieldMappingConfigProps) {
  const [sourceType, setSourceType] = useState<'cell' | 'range' | 'formula'>(
    mapping?.source_type || 'cell'
  );
  const [sourceValue, setSourceValue] = useState(mapping?.source_value || '');
  const [aggregation, setAggregation] = useState<AggregationType>(
    mapping?.aggregation || 'value'
  );
  const [format, setFormat] = useState<DataFormat>(
    mapping?.format || card.defaultFormat
  );
  const [customFormula, setCustomFormula] = useState(mapping?.custom_formula || '');

  const handleUpdate = () => {
    onChange({
      card_id: card.id,
      card_name: card.name,
      source_type: sourceType,
      source_value: sourceValue,
      aggregation: aggregation,
      format: format,
      custom_formula: aggregation === 'formula' ? customFormula : undefined,
    });
  };

  // Atualiza sempre que algum campo muda
  const handleSourceTypeChange = (value: 'cell' | 'range' | 'formula') => {
    setSourceType(value);
    // Ajusta agregação padrão baseado no tipo
    if (value === 'cell') {
      setAggregation('value');
    } else if (value === 'range') {
      setAggregation('sum');
    }
    setTimeout(handleUpdate, 0);
  };

  const handleSourceValueChange = (value: string) => {
    setSourceValue(value);
    setTimeout(handleUpdate, 0);
  };

  const handleAggregationChange = (value: AggregationType) => {
    setAggregation(value);
    setTimeout(handleUpdate, 0);
  };

  const handleFormatChange = (value: DataFormat) => {
    setFormat(value);
    setTimeout(handleUpdate, 0);
  };

  const handleCustomFormulaChange = (value: string) => {
    setCustomFormula(value);
    setTimeout(handleUpdate, 0);
  };

  return (
    <Card className="border-l-4 border-l-primary/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4" />
          {card.name}
        </CardTitle>
        <CardDescription className="text-xs">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de Origem */}
        <div className="space-y-2">
          <Label className="text-xs">Tipo de Origem</Label>
          <Select value={sourceType} onValueChange={handleSourceTypeChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cell">📍 Célula única (ex: B5)</SelectItem>
              <SelectItem value="range">📊 Range (ex: D10:D50)</SelectItem>
              <SelectItem value="formula">🧮 Fórmula customizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campo de Origem */}
        <div className="space-y-2">
          <Label className="text-xs">
            {sourceType === 'cell' && 'Célula'}
            {sourceType === 'range' && 'Range'}
            {sourceType === 'formula' && 'Fórmula'}
          </Label>
          <Input
            placeholder={
              sourceType === 'cell'
                ? 'Ex: B5'
                : sourceType === 'range'
                ? 'Ex: D10:D50'
                : 'Ex: =(B5/C5)*100'
            }
            value={sourceValue}
            onChange={(e) => handleSourceValueChange(e.target.value)}
            className="h-9 font-mono text-sm"
          />
          {sourceType === 'cell' && (
            <p className="text-xs text-muted-foreground">
              Ex: A1, B10, Z99
            </p>
          )}
          {sourceType === 'range' && (
            <p className="text-xs text-muted-foreground">
              Ex: A1:A100, D10:D50, B:B (coluna inteira)
            </p>
          )}
          {sourceType === 'formula' && (
            <p className="text-xs text-muted-foreground">
              Ex: =(B5/C5)*100, =SUM(A1:A10)/COUNT(B:B)
            </p>
          )}
        </div>

        {/* Agregação (só para range) */}
        {sourceType === 'range' && (
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Tipo de Agregação
            </Label>
            <Select value={aggregation} onValueChange={handleAggregationChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">➕ Soma</SelectItem>
                <SelectItem value="average">📊 Média</SelectItem>
                <SelectItem value="count">🔢 Contagem</SelectItem>
                <SelectItem value="last">⬇️ Último valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Formato */}
        <div className="space-y-2">
          <Label className="text-xs">Formato de Exibição</Label>
          <Select value={format} onValueChange={handleFormatChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">🔢 Número</SelectItem>
              <SelectItem value="currency">💰 Moeda (R$)</SelectItem>
              <SelectItem value="percentage">📊 Porcentagem (%)</SelectItem>
              <SelectItem value="text">📝 Texto</SelectItem>
              <SelectItem value="date">📅 Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        {sourceValue && (
          <div className="p-3 bg-muted/50 rounded-md space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Preview:</p>
            <p className="text-sm font-mono">
              {sourceType === 'cell' && `Valor em ${sourceValue}`}
              {sourceType === 'range' && `${aggregation.toUpperCase()} de ${sourceValue}`}
              {sourceType === 'formula' && sourceValue}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
