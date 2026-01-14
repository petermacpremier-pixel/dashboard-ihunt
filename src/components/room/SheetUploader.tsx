import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CharacterSheet } from '@/types/ihunt';
import { Upload, FileJson, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SheetUploaderProps {
  onUpload: (sheet: CharacterSheet) => void;
  currentSheet?: CharacterSheet;
}

function parseIHuntJson(json: any): CharacterSheet {
  // Handle the specific iHunt JSON format
  return {
    nome: json.nome || json.name || 'Personagem',
    conceito: json.conceito || json.aspectos?.find((a: any) => a.tipo === 'Conceito')?.descricao,
    drama: json.drama || json.aspectos?.find((a: any) => a.tipo === 'Drama')?.descricao,
    trampo: json.trampo || json.aspectos?.find((a: any) => a.tipo === 'Trampo')?.descricao,
    sonhos: json.sonhos || json.aspectos?.find((a: any) => a.tipo === 'Sonhos')?.descricao,
    aspectos: json.aspectos || [],
    habilidades: json.habilidades || [],
    manobras: json.manobras || [],
    stress_fisico: json.stress_fisico || json.stress?.fisico || [false, false, false, false],
    stress_mental: json.stress_mental || json.stress?.mental || [false, false, false, false],
    consequencias: json.consequencias || [
      { nivel: 'Suave (2)', descricao: '' },
      { nivel: 'Moderada (4)', descricao: '' },
      { nivel: 'Grave (6)', descricao: '' },
    ],
    pontos_destino: json.pontos_destino ?? json.fate_points ?? 3,
    pontos_destino_max: json.pontos_destino_max ?? json.fate_points_max ?? 3,
    dons: json.dons || [],
    notas: json.notas || json.notes || '',
  };
}

export function SheetUploader({ onUpload, currentSheet }: SheetUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.json')) {
      setError('Por favor, envie um arquivo JSON');
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const sheet = parseIHuntJson(json);
      
      onUpload(sheet);
      toast({
        title: 'Ficha carregada!',
        description: `${sheet.nome} está pronto para a caçada.`,
      });
    } catch (e) {
      setError('Erro ao ler o arquivo JSON. Verifique o formato.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="p-4 space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/10'
            : currentSheet
            ? 'border-success/50 bg-success/5'
            : 'border-border hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <CardContent className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleInputChange}
          />
          
          {currentSheet ? (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-success" />
              </div>
              <p className="font-medium">{currentSheet.nome}</p>
              <p className="text-sm text-muted-foreground">
                Clique para trocar a ficha
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Envie sua ficha</p>
              <p className="text-sm text-muted-foreground">
                Arraste um arquivo JSON ou clique para selecionar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1">
          <FileJson className="w-3 h-3" />
          Formato esperado: JSON com campos de ficha iHunt
        </p>
      </div>
    </div>
  );
}
