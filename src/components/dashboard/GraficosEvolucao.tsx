import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ProductData } from '@/types/dashboard';

interface GraficosEvolucaoProps {
  productData: ProductData | undefined;
  productName: string;
}

export function GraficosEvolucao({ productData, productName }: GraficosEvolucaoProps) {
  if (!productData) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Prepare data for charts
  const weeklyData = productData.semanas.map((semana, index) => ({
    semana: `S${index + 1}`,
    faturamento: semana.faturamentoFunil,
    investido: semana.investido,
    lucro: semana.lucroFunil,
    taxaConversao: semana.taxaConversao,
    taxaAgendamento: semana.taxaAgendamento,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Taxa') ? `${entry.value.toFixed(2)}%` : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Gráfico de Faturamento vs Investimento */}
      <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 max-md:p-4 animate-fade-in-up delay-1">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white max-md:text-lg max-md:mb-4">
          <span className="text-3xl">📈</span>
          Evolução Semanal - Financeiro ({productName})
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="semana" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="faturamento" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 6 }}
              activeDot={{ r: 8 }}
              name="Faturamento"
            />
            <Line 
              type="monotone" 
              dataKey="investido" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 6 }}
              activeDot={{ r: 8 }}
              name="Investido"
            />
            <Line 
              type="monotone" 
              dataKey="lucro" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 6 }}
              activeDot={{ r: 8 }}
              name="Lucro"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Taxas de Conversão */}
      <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 max-md:p-4 animate-fade-in-up delay-2">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white max-md:text-lg max-md:mb-4">
          <span className="text-3xl">📊</span>
          Evolução Semanal - Taxas de Conversão ({productName})
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="semana" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="taxaConversao" 
              stroke="#ec4899" 
              strokeWidth={3}
              dot={{ fill: '#ec4899', r: 6 }}
              activeDot={{ r: 8 }}
              name="Taxa de Conversão"
            />
            <Line 
              type="monotone" 
              dataKey="taxaAgendamento" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 6 }}
              activeDot={{ r: 8 }}
              name="Taxa de Agendamento"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
