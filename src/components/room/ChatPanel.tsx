import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, DiceRollResult } from '@/types/ihunt';
import { Send, Dice1, Dice6, Plus, Minus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentPlayerId: string;
  onSendMessage: (content: string) => void;
  onSendRoll: (result: DiceRollResult, description?: string) => void;
}

function FateDie({ value }: { value: number }) {
  const symbol = value === 1 ? '+' : value === -1 ? '−' : '○';
  const className = value === 1 ? 'positive' : value === -1 ? 'negative' : 'neutral';
  return <span className={cn('fate-die', className)}>{symbol}</span>;
}

function RollDisplay({ result }: { result: DiceRollResult }) {
  if (result.diceType === 'fate' || result.diceType === 'advantage') {
    const fateTotal = result.dice.reduce((a, b) => a + b, 0);
    const bonusValue = result.bonusDie || 0;
    const finalTotal = fateTotal + bonusValue + result.modifier;
    
    return (
      <div className="space-y-2">
        <div className="flex gap-1 flex-wrap items-center">
          {result.dice.map((die, i) => (
            <FateDie key={i} value={die} />
          ))}
          {result.bonusDie !== undefined && (
            <>
              <span className="text-muted-foreground mx-1">+</span>
              <span className="w-8 h-8 rounded bg-warning/20 border border-warning flex items-center justify-center font-bold text-warning">
                {result.bonusDie}
              </span>
            </>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {result.diceType === 'advantage' ? (
            <span>
              Fate: {fateTotal} + d6: {bonusValue}
              {result.modifier !== 0 && <span> {result.modifier > 0 ? '+' : ''}{result.modifier}</span>}
              {' = '}<strong className="text-foreground">{finalTotal}</strong>
            </span>
          ) : (
            <span>
              Resultado: {fateTotal}
              {result.modifier !== 0 && <span> {result.modifier > 0 ? '+' : ''}{result.modifier}</span>}
              {' = '}<strong className="text-foreground">{fateTotal + result.modifier}</strong>
            </span>
          )}
        </div>
      </div>
    );
  }

  const diceTotal = result.dice.reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {result.dice.map((die, i) => (
          <span key={i} className="w-8 h-8 rounded bg-secondary flex items-center justify-center font-bold">
            {die}
          </span>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        Total: {diceTotal}
        {result.modifier !== 0 && (
          <span> {result.modifier > 0 ? '+' : ''}{result.modifier} = <strong className="text-foreground">{result.total}</strong></span>
        )}
      </div>
    </div>
  );
}

export function ChatPanel({ messages, currentPlayerId, onSendMessage, onSendRoll }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [modifier, setModifier] = useState(0);
  const [rollDescription, setRollDescription] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // Roll 4dF (standard Fate roll)
  const rollFate = () => {
    const dice = Array(4).fill(0).map(() => {
      const roll = Math.random();
      if (roll < 1/3) return -1;
      if (roll < 2/3) return 0;
      return 1;
    });
    const total = dice.reduce((a, b) => a + b, 0) + modifier;
    
    onSendRoll({
      dice,
      total,
      modifier,
      diceType: 'fate',
      description: rollDescription || undefined,
    }, rollDescription || '4dF');
    setRollDescription('');
  };

  // Roll 3dF + 1d6 (Advantage roll)
  const rollAdvantage = () => {
    const fateDice = Array(3).fill(0).map(() => {
      const roll = Math.random();
      if (roll < 1/3) return -1;
      if (roll < 2/3) return 0;
      return 1;
    });
    const bonusDie = Math.floor(Math.random() * 6) + 1;
    const fateTotal = fateDice.reduce((a, b) => a + b, 0);
    const total = fateTotal + bonusDie + modifier;
    
    onSendRoll({
      dice: fateDice,
      bonusDie,
      total,
      modifier,
      diceType: 'advantage',
      description: rollDescription || undefined,
    }, rollDescription || '3dF + 1d6 (Vantagem)');
    setRollDescription('');
  };

  const rollDice = (sides: number, count: number = 1) => {
    const dice = Array(count).fill(0).map(() => Math.floor(Math.random() * sides) + 1);
    const total = dice.reduce((a, b) => a + b, 0) + modifier;
    
    onSendRoll({
      dice,
      total,
      modifier,
      diceType: `d${sides}` as any,
      description: rollDescription || undefined,
    }, rollDescription || `${count}d${sides}`);
    setRollDescription('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              Nenhuma mensagem ainda. Comece a conversar!
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'rounded-lg p-3',
                msg.type === 'system' && 'bg-muted/50 text-center text-sm text-muted-foreground italic',
                msg.type === 'message' && msg.playerId === currentPlayerId && 'bg-primary/20 ml-8',
                msg.type === 'message' && msg.playerId !== currentPlayerId && 'bg-muted mr-8',
                msg.type === 'roll' && 'bg-secondary/50 border border-primary/30'
              )}
            >
              {msg.type !== 'system' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-primary">{msg.playerName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              
              {msg.type === 'roll' && msg.rollResult ? (
                <div>
                  <p className="text-sm mb-2">{msg.content}</p>
                  <RollDisplay result={msg.rollResult} />
                </div>
              ) : (
                <p className={msg.type === 'system' ? '' : 'text-sm'}>{msg.content}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Dice Roller */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Descrição da rolagem (opcional)"
              value={rollDescription}
              onChange={(e) => setRollDescription(e.target.value)}
              className="flex-1 h-8 text-sm"
            />
            <div className="flex items-center gap-1 bg-background rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setModifier(m => m - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center font-mono text-sm">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setModifier(m => m + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            <Button
              variant="default"
              size="sm"
              onClick={rollFate}
              className="gap-1"
            >
              <Dice1 className="w-4 h-4" />
              4dF
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={rollAdvantage}
              className="gap-1 bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              <Zap className="w-4 h-4" />
              Vantagem
            </Button>
            {[4, 6, 8, 10, 12, 20].map(sides => (
              <Button
                key={sides}
                variant="outline"
                size="sm"
                onClick={() => rollDice(sides)}
              >
                d{sides}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
