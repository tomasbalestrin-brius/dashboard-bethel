import type { FunnelData } from '@/types/dashboard';

interface FunnelProps {
  data: FunnelData;
  productName: string;
  period: string;
}

export function Funnel({ data, productName, period }: FunnelProps) {
  const { alunos, qualificados, agendados, callRealizada, vendas } = data;

  if (alunos === 0 && qualificados === 0 && agendados === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-[60px] px-5 text-center bg-[hsl(var(--bg-primary))] rounded-2xl border-2 border-dashed border-[hsl(var(--border-color))] min-h-[400px] max-md:p-10 max-md:px-[15px] max-md:min-h-[300px]">
        <div className="text-6xl mb-5 opacity-50 max-md:text-5xl">📊</div>
        <div className="text-[1.8rem] font-bold text-[hsl(var(--text-primary))] mb-3 max-md:text-2xl">
          Sem dados para este período
        </div>
        <div className="text-[1.05rem] text-[hsl(var(--text-secondary))] mb-[25px] max-w-[500px] leading-relaxed max-md:text-[0.95rem]">
          Não há informações de funil para o período selecionado.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-3">
      {/* Alunos */}
      <div className="w-full text-center p-3.5 rounded-lg relative transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#059669] to-[#10b981] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-md:p-[18px] max-md:px-3">
        <div className="text-[1.05rem] opacity-95 mb-1.5 font-bold max-md:text-base">👥 Alunos</div>
        <div className="text-[2.2rem] font-extrabold mb-1.5 max-md:text-[2rem]">{alunos}</div>
        <div className="text-[1.15rem] opacity-95 flex items-center justify-center gap-1.5 font-semibold max-md:text-[1.05rem] max-md:flex-col max-md:gap-0.5">
          <span>100%</span>
          <span className="text-sm opacity-85 italic font-medium max-md:text-[0.85rem]">(base)</span>
        </div>
      </div>
      
      <div className="text-2xl text-[hsl(var(--text-secondary))] -my-1.5">▼</div>
      
      {/* Qualificados */}
      <div className="w-[85%] text-center p-3.5 rounded-lg relative transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#0891b2] to-[#06b6d4] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-md:p-[18px] max-md:px-3">
        <div className="text-[1.05rem] opacity-95 mb-1.5 font-bold max-md:text-base">✅ Qualificados</div>
        <div className="text-[2.2rem] font-extrabold mb-1.5 max-md:text-[2rem]">{qualificados}</div>
        <div className="text-[1.15rem] opacity-95 flex items-center justify-center gap-1.5 font-semibold max-md:text-[1.05rem] max-md:flex-col max-md:gap-0.5">
          <span>{alunos > 0 ? ((qualificados / alunos) * 100).toFixed(1) : 0}%</span>
          <span className="text-sm opacity-85 italic font-medium max-md:text-[0.85rem]">(do total de alunos)</span>
        </div>
      </div>
      
      <div className="text-2xl text-[hsl(var(--text-secondary))] -my-1.5">▼</div>
      
      {/* Call Agendadas */}
      <div className="w-[70%] text-center p-3.5 rounded-lg relative transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#2563eb] to-[#3b82f6] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-md:p-[18px] max-md:px-3">
        <div className="text-[1.05rem] opacity-95 mb-1.5 font-bold max-md:text-base">📅 Call Agendadas</div>
        <div className="text-[2.2rem] font-extrabold mb-1.5 max-md:text-[2rem]">{agendados}</div>
        <div className="text-[1.15rem] opacity-95 flex items-center justify-center gap-1.5 font-semibold max-md:text-[1.05rem] max-md:flex-col max-md:gap-0.5">
          <span>{qualificados > 0 ? ((agendados / qualificados) * 100).toFixed(1) : 0}%</span>
          <span className="text-sm opacity-85 italic font-medium max-md:text-[0.85rem]">(dos qualificados)</span>
        </div>
      </div>
      
      <div className="text-2xl text-[hsl(var(--text-secondary))] -my-1.5">▼</div>
      
      {/* Call Realizadas */}
      <div className="w-[55%] text-center p-3.5 rounded-lg relative transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-md:p-[18px] max-md:px-3">
        <div className="text-[1.05rem] opacity-95 mb-1.5 font-bold max-md:text-base">📞 Call Realizadas</div>
        <div className="text-[2.2rem] font-extrabold mb-1.5 max-md:text-[2rem]">{callRealizada}</div>
        <div className="text-[1.15rem] opacity-95 flex items-center justify-center gap-1.5 font-semibold max-md:text-[1.05rem] max-md:flex-col max-md:gap-0.5">
          <span>{agendados > 0 ? ((callRealizada / agendados) * 100).toFixed(1) : 0}%</span>
          <span className="text-sm opacity-85 italic font-medium max-md:text-[0.85rem]">(dos agendados)</span>
        </div>
      </div>
      
      <div className="text-2xl text-[hsl(var(--text-secondary))] -my-1.5">▼</div>
      
      {/* Vendas */}
      <div className="w-[40%] text-center p-3.5 rounded-lg relative transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#c026d3] to-[#d946ef] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-md:p-[18px] max-md:px-3">
        <div className="text-[1.05rem] opacity-95 mb-1.5 font-bold max-md:text-base">💰 Vendas</div>
        <div className="text-[2.2rem] font-extrabold mb-1.5 max-md:text-[2rem]">{vendas}</div>
        <div className="text-[1.15rem] opacity-95 flex items-center justify-center gap-1.5 font-semibold max-md:text-[1.05rem] max-md:flex-col max-md:gap-0.5">
          <span>{callRealizada > 0 ? ((vendas / callRealizada) * 100).toFixed(1) : 0}%</span>
          <span className="text-sm opacity-85 italic font-medium max-md:text-[0.85rem]">(das calls)</span>
        </div>
      </div>
    </div>
  );
}
