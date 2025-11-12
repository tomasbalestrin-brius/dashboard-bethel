export function ExportarModule() {
  const exportOptions = [
    {
      icon: '📄',
      title: 'Exportar PDF',
      description: 'Gere um relatório completo em PDF',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: '📊',
      title: 'Exportar Excel',
      description: 'Baixe todos os dados em planilha',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: '📋',
      title: 'Exportar CSV',
      description: 'Arquivo CSV para análise de dados',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: '🔗',
      title: 'Compartilhar Link',
      description: 'Gere um link para compartilhar',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const handleExport = (type: string) => {
    alert(`Funcionalidade de ${type} em desenvolvimento!`);
  };

  return (
    <div>
      <div className="text-center mb-10 p-5">
        <h1 className="text-[3.5rem] bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] bg-clip-text text-transparent mb-[15px] font-extrabold max-md:text-[1.8rem]">
          📥 EXPORTAR DADOS
        </h1>
        <p className="text-xl text-[hsl(var(--text-secondary))] mb-2.5 max-md:text-sm">
          Exporte seus dados em diferentes formatos
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mb-[30px] max-md:grid-cols-1">
        {exportOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleExport(option.title)}
            className="bg-[hsl(var(--bg-secondary))] p-[30px] rounded-xl border-2 border-[hsl(var(--border-color))] cursor-pointer transition-all duration-300 text-center hover:border-[hsl(var(--accent-primary))] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
          >
            <div className="text-5xl mb-[15px]">{option.icon}</div>
            <div className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">
              {option.title}
            </div>
            <div className="text-sm text-[hsl(var(--text-secondary))]">
              {option.description}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-[hsl(var(--bg-secondary))] p-8 rounded-2xl border-2 border-[hsl(var(--border-color))]">
        <h3 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-4">
          ℹ️ Informações sobre Exportação
        </h3>
        <div className="text-[hsl(var(--text-secondary))] space-y-3">
          <p>• <strong>PDF:</strong> Ideal para apresentações e relatórios executivos</p>
          <p>• <strong>Excel:</strong> Perfeito para análises detalhadas e gráficos personalizados</p>
          <p>• <strong>CSV:</strong> Formato universal compatível com qualquer ferramenta de análise</p>
          <p>• <strong>Compartilhar:</strong> Gere um link seguro para compartilhar com sua equipe</p>
        </div>
      </div>
    </div>
  );
}
