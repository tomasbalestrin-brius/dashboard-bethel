interface TeamSelectorProps {
  currentTeam: 'geral' | 'cleiton' | 'julia';
  onTeamSelect: (team: 'geral' | 'cleiton' | 'julia') => void;
}

export function TeamSelector({ currentTeam, onTeamSelect }: TeamSelectorProps) {
  const teams = [
    { id: 'geral' as const, label: '📊 GERAL', className: 'geral-btn' },
    { id: 'cleiton' as const, label: '👨‍💼 CLEITON', className: '' },
    { id: 'julia' as const, label: '👩‍💼 JULIA', className: '' },
  ];

  return (
    <div className="flex justify-center gap-[25px] mb-[35px] max-md:flex-col max-md:gap-2.5">
      {teams.map(team => (
        <button
          key={team.id}
          onClick={() => onTeamSelect(team.id)}
          className={`
            py-[25px] px-[60px] border-[3px] border-[hsl(var(--border-color))] rounded-2xl text-2xl font-extrabold cursor-pointer transition-all duration-300 bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))]
            hover:-translate-y-[3px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.4)]
            max-md:w-full max-md:max-w-full max-md:py-[18px]
            max-[480px]:py-[15px] max-[480px]:text-base
            ${currentTeam === team.id ? (team.id === 'geral' ? 'bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[#60a5fa] border-[hsl(var(--accent-primary))] shadow-[0_10px_30px_rgba(59,130,246,0.5)]' : 'bg-gradient-to-r from-[hsl(var(--accent-secondary))] to-[#a855f7] border-[hsl(var(--accent-secondary))] text-white shadow-[0_10px_30px_rgba(139,92,246,0.5)]') + ' -translate-y-[3px]' : ''}
          `}
        >
          {team.label}
        </button>
      ))}
    </div>
  );
}
