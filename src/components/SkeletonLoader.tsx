export function CardSkeleton() {
  return (
    <div className="h-[120px] rounded-lg bg-slate-800/50 p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-1/3 bg-slate-700 rounded" />
        <div className="h-6 w-1/2 bg-slate-700 rounded" />
        <div className="h-3 w-2/3 bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 animate-pulse">
      {/* Header */}
      <div className="grid grid-cols-6 gap-4 border-b border-slate-700 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-700 rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid grid-cols-6 gap-4 p-4 ${
            rowIndex % 2 === 0 ? 'bg-slate-800/30' : ''
          }`}
        >
          {Array.from({ length: 6 }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-slate-700 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-[300px] rounded-lg bg-slate-800/50 p-6 animate-pulse">
      <div className="h-full flex items-end justify-around gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-700 rounded-t w-full"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}
