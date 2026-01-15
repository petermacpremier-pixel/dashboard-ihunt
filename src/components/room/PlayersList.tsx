import { Player } from '@/types/ihunt';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, User, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayersListProps {
  players: Player[];
  currentPlayerId: string;
  onSelectPlayer: (player: Player) => void;
}

export function PlayersList({ players, currentPlayerId, onSelectPlayer }: PlayersListProps) {
  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Jogadores Online ({players.length})
      </h3>
      <div className="space-y-2">
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => onSelectPlayer(player)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
              'hover:bg-muted/50',
              player.id === currentPlayerId && 'bg-primary/10 border border-primary/30'
            )}
          >
            <div className="relative">
              <Avatar className={cn(
                'w-10 h-10',
                player.isMaster && 'ring-2 ring-warning'
              )}>
                <AvatarImage src={player.sheet?.avatarUrl} alt={player.name} />
                <AvatarFallback className={cn(
                  player.isMaster ? 'bg-warning/20' : 'bg-secondary'
                )}>
                  {player.isMaster ? (
                    <Crown className="w-5 h-5 text-warning" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-success text-success" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{player.name}</span>
                {player.id === currentPlayerId && (
                  <Badge variant="outline" className="text-xs">você</Badge>
                )}
              </div>
              {player.sheet ? (
                <span className="text-xs text-muted-foreground truncate block">
                  {player.sheet.nome}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Sem ficha</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
