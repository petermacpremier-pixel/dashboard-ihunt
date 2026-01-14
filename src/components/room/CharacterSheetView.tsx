import { useState, useEffect } from 'react';
import { CharacterSheet } from '@/types/ihunt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Heart, 
  Brain, 
  Zap, 
  Swords,
  Sparkles,
  FileText,
  Plus,
  Minus,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterSheetViewProps {
  sheet: CharacterSheet;
  isEditable: boolean;
  onUpdate?: (sheet: CharacterSheet) => void;
}

export function CharacterSheetView({ sheet, isEditable, onUpdate }: CharacterSheetViewProps) {
  const [localSheet, setLocalSheet] = useState(sheet);

  // Sync with external sheet changes
  useEffect(() => {
    setLocalSheet(sheet);
  }, [sheet]);

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
    const newValue = Math.max(0, Math.min(localSheet.pontos_destino_max + 5, localSheet.pontos_destino + delta));
    updateSheet({ pontos_destino: newValue });
  };

  const sortedHabilidades = [...localSheet.habilidades].sort((a, b) => b.nivel - a.nivel);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">{localSheet.nome}</h2>
          {localSheet.drive && (
            <Badge variant="secondary" className="capitalize">{localSheet.drive}</Badge>
          )}
          
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
                {Array(Math.max(localSheet.pontos_destino, localSheet.pontos_destino_max)).fill(0).map((_, i) => (
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
            {localSheet.aspectos.length > 0 ? (
              localSheet.aspectos.map((aspecto, i) => (
                <Card key={i} className="bg-muted/30">
                  <CardContent className="p-3">
                    <Badge variant="outline" className="mb-2 text-xs">{aspecto.tipo}</Badge>
                    <p className="text-sm">{aspecto.descricao}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum aspecto definido</p>
            )}
          </TabsContent>

          {/* Habilidades */}
          <TabsContent value="habilidades" className="space-y-2 mt-3">
            {sortedHabilidades.length > 0 ? (
              sortedHabilidades.map((hab, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm">{hab.nome}</span>
                  <Badge 
                    variant={hab.nivel >= 4 ? 'default' : hab.nivel >= 2 ? 'secondary' : 'outline'}
                    className="font-mono"
                  >
                    {hab.nivel >= 0 ? `+${hab.nivel}` : hab.nivel}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma habilidade definida</p>
            )}
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
                        'w-8 h-8 rounded border-2 flex items-center justify-center font-bold text-sm transition-colors',
                        isEditable && 'cursor-pointer',
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
                        'w-8 h-8 rounded border-2 flex items-center justify-center font-bold text-sm transition-colors',
                        isEditable && 'cursor-pointer',
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
            {localSheet.manobras.length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Swords className="w-4 h-4" />
                    Manobras
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2">
                    {localSheet.manobras.map((man, i) => (
                      <Badge key={i} variant="secondary">{man.nome}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manobras de Habilidade */}
            {localSheet.manobras_habilidade.length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Manobras de Habilidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2">
                    {localSheet.manobras_habilidade.map((man, i) => (
                      <Badge key={i} variant="outline">{man.nome}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{dom.nome}</span>
                        {dom.nivel && <Badge variant="outline" className="text-xs">Nível {dom.nivel}</Badge>}
                        {dom.custo_essencia && <Badge variant="secondary" className="text-xs">Essência: {dom.custo_essencia}</Badge>}
                      </div>
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
