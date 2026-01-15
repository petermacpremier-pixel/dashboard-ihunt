import { cn } from '@/lib/utils';

const difficulties = [
  { level: 8, name: 'Lendário', color: 'text-yellow-400' },
  { level: 7, name: 'Épico', color: 'text-purple-400' },
  { level: 6, name: 'Fantástico', color: 'text-blue-400' },
  { level: 5, name: 'Soberbo', color: 'text-cyan-400' },
  { level: 4, name: 'Ótimo', color: 'text-green-400' },
  { level: 3, name: 'Bom', color: 'text-emerald-400' },
  { level: 2, name: 'Razoável', color: 'text-lime-400' },
  { level: 1, name: 'Regular', color: 'text-gray-300' },
  { level: 0, name: 'Medíocre', color: 'text-gray-400' },
  { level: -1, name: 'Ruim', color: 'text-orange-400' },
  { level: -2, name: 'Terrível', color: 'text-red-400' },
];

export function DifficultyTable() {
  return (
    <div className="w-48">
      <h4 className="font-semibold text-sm mb-2 text-center">Tabela de Dificuldade</h4>
      <div className="space-y-0.5">
        {difficulties.map(({ level, name, color }) => (
          <div 
            key={level} 
            className="flex items-center justify-between px-2 py-1 rounded bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className={cn('font-mono text-sm font-bold w-8', color)}>
              {level >= 0 ? `+${level}` : level}
            </span>
            <span className={cn('text-sm', color)}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
