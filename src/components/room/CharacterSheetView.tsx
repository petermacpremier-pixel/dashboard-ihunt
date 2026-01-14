import { useState } from 'react';
import { CharacterSheet } from '@/types/ihunt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Heart, 
  Brain, 
  Zap, 
  BookOpen, 
  Swords,
  Sparkles,
  FileText,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterSheetViewProps {
  sheet: CharacterSheet;
  isEditable: boolean;
  onUpdate?: (sheet: CharacterSheet) => void;
}

export function CharacterSheetView({ sheet, isEditable, onUpdate }: CharacterSheetViewProps) {
  const [localSheet, setLocalSheet] = useState(sheet);

  const updateSheet = (updates: Partial<CharacterSheet>) => {
    const newSheet = { ...localSheet, ...updates };
    setLocalSheet(newSheet);
    onUpdate?.(newSheet);
  };

  const toggleStress = (type: 'fisico' | 'mental', index: number) => {
    if (!isEditable) return;
    const key = type === 'fisico' ? 'stress_fisico' : 'stress_mental';
    const newStress = [...localSheet[key]];
    newStress[index] = !newStress[index];
    updateSheet({ [key]: newStress });
  };

  const updateConsequence = (index: number, descricao: string) => {
    if (!isEditable) return;
    const newConsequencias = [...localSheet.consequencias];
    newConsequencias[index] = { ...newConsequencias[index], descricao };
    updateSheet({ consequencias: newConsequencias });
  };

  const adjustDestiny = (delta: number) => {
    if (!isEditable) return;
    const newValue = Math.max(0, Math.min(localSheet.pontos_destino_max, localSheet.pontos_destino + delta));
    updateSheet({ pontos_destino: newValue });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">{localSheet.nome}</h2>
          
          {/* Destiny Points */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Pontos de Destino:</span>
            <div className="flex items-center gap-2">
              {isEditable && (
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustDestiny(-1)}>
                  <Minus className="w-3 h-3" />
                </Button>
              )}
              <div className="flex gap-1">
                {Array(localSheet.pontos_destino_max).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5 transition-colors',
                      i < localSheet.pontos_destino
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              {isEditable && (
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustDestiny(1)}>
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="aspectos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="aspectos" className="text-xs">Aspectos</TabsTrigger>
            <TabsTrigger value="habilidades" className="text-xs">Habilidades</TabsTrigger>
            <TabsTrigger value="stress" className="text-xs">Stress</TabsTrigger>
            <TabsTrigger value="extras" className="text-xs">Extras</TabsTrigger>
          </TabsList>

          {/* Aspectos */}
          <TabsContent value="aspectos" className="space-y-3 mt-3">
            {localSheet.aspectos.map((aspecto, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="p-3">
                  <Badge variant="outline" className="mb-2 text-xs">{aspecto.tipo}</Badge>
                  <p className="text-sm">{aspecto.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Habilidades */}
          <TabsContent value="habilidades" className="space-y-2 mt-3">
            {[...localSheet.habilidades]
              .sort((a, b) => b.nivel - a.nivel)
              .map((hab, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">{hab.nome}</span>
                  <Badge 
                    variant={hab.nivel >= 3 ? 'default' : hab.nivel >= 1 ? 'secondary' : 'outline'}
                    className="font-mono"
                  >
                    {hab.nivel >= 0 ? `+${hab.nivel}` : hab.nivel}
                  </Badge>
                </div>
              ))}
          </TabsContent>

          {/* Stress & Consequences */}
          <TabsContent value="stress" className="space-y-4 mt-3">
            {/* Physical Stress */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  Stress Físico
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex gap-2 flex-wrap">
                  {localSheet.stress_fisico.map((checked, i) => (
                    <div
                      key={i}
                      onClick={() => toggleStress('fisico', i)}
                      className={cn(
                        'w-8 h-8 rounded border-2 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors',
                        checked
                          ? 'bg-destructive border-destructive text-destructive-foreground'
                          : 'border-border hover:border-destructive/50'
                      )}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mental Stress */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent" />
                  Stress Mental
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex gap-2 flex-wrap">
                  {localSheet.stress_mental.map((checked, i) => (
                    <div
                      key={i}
                      onClick={() => toggleStress('mental', i)}
                      className={cn(
                        'w-8 h-8 rounded border-2 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors',
                        checked
                          ? 'bg-accent border-accent text-accent-foreground'
                          : 'border-border hover:border-accent/50'
                      )}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consequences */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  Consequências
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 space-y-2">
                {localSheet.consequencias.map((cons, i) => (
                  <div key={i} className="space-y-1">
                    <Badge variant="outline" className="text-xs">{cons.nivel}</Badge>
                    {isEditable ? (
                      <Input
                        value={cons.descricao}
                        onChange={(e) => updateConsequence(i, e.target.value)}
                        placeholder="Vazio"
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {cons.descricao || 'Vazio'}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extras */}
          <TabsContent value="extras" className="space-y-4 mt-3">
            {/* Manobras */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  Manobras
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 space-y-2">
                {localSheet.manobras.map((man, i) => (
                  <div key={i} className="p-2 rounded bg-background/50">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={man.ativa} disabled />
                      <span className="font-medium text-sm">{man.nome}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">{man.descricao}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dons */}
            {localSheet.dons.length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Dons
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 space-y-2">
                  {localSheet.dons.map((dom, i) => (
                    <div key={i} className="p-2 rounded bg-background/50">
                      <span className="font-medium text-sm">{dom.nome}</span>
                      <p className="text-xs text-muted-foreground mt-1">{dom.descricao}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Notas */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                {isEditable ? (
                  <Textarea
                    value={localSheet.notas || ''}
                    onChange={(e) => updateSheet({ notas: e.target.value })}
                    placeholder="Anotações do personagem..."
                    className="min-h-[100px] text-sm"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {localSheet.notas || 'Sem anotações'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
