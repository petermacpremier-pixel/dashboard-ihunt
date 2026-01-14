import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CharacterSheet, Aspecto, Habilidade, Manobra, Dom, Consequencia } from '@/types/ihunt';
import { Upload, FileJson, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SheetUploaderProps {
  onUpload: (sheet: CharacterSheet) => void;
  currentSheet?: CharacterSheet;
}

// Mapeamento de IDs de manobras para nomes legíveis
const MANEUVER_NAMES: Record<string, string> = {
  'sabe-das-coisas': 'Sabe das Coisas',
  'mestre-pesquisa': 'Mestre da Pesquisa',
  'golpe-rasteiro': 'Golpe Rasteiro',
  'embruxacao': 'Embruxação',
  'all-access': 'Acesso Total',
  'conhecimentos-ocultos': 'Conhecimentos Ocultos',
  'contatos': 'Contatos',
  'especialista': 'Especialista',
  'faca-na-caveira': 'Faca na Caveira',
  'mente-fria': 'Mente Fria',
  'olhar-aguiado': 'Olhar Aguçado',
  'pericia-tecnica': 'Perícia Técnica',
  'resistencia': 'Resistência',
  'sexto-sentido': 'Sexto Sentido',
  'sombras': 'Sombras',
  'tiro-certeiro': 'Tiro Certeiro',
  'veterano': 'Veterano',
};

function parseIHuntJson(json: any): CharacterSheet {
  // Parse aspects from English format
  const aspectos: Aspecto[] = [];
  if (json.aspects) {
    if (json.aspects.highConcept) {
      aspectos.push({ tipo: 'Conceito', descricao: json.aspects.highConcept });
    }
    if (json.aspects.drama) {
      aspectos.push({ tipo: 'Drama', descricao: json.aspects.drama });
    }
    if (json.aspects.job) {
      aspectos.push({ tipo: 'Trampo', descricao: json.aspects.job });
    }
    if (json.aspects.dreamBoard) {
      aspectos.push({ tipo: 'Sonhos', descricao: json.aspects.dreamBoard });
    }
    if (json.aspects.free && Array.isArray(json.aspects.free)) {
      json.aspects.free.forEach((free: string, i: number) => {
        if (free) {
          aspectos.push({ tipo: `Livre ${i + 1}`, descricao: free });
        }
      });
    }
  }

  // Parse skills from object format {skillName: level}
  const habilidades: Habilidade[] = [];
  if (json.skills && typeof json.skills === 'object') {
    Object.entries(json.skills).forEach(([nome, nivel]) => {
      habilidades.push({ nome, nivel: nivel as number });
    });
  }

  // Parse maneuvers from array of IDs
  const manobras: Manobra[] = [];
  if (json.maneuvers && Array.isArray(json.maneuvers)) {
    json.maneuvers.forEach((id: string) => {
      manobras.push({
        id,
        nome: MANEUVER_NAMES[id] || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      });
    });
  }

  // Parse skill maneuvers
  const manobras_habilidade: Manobra[] = [];
  if (json.skillManeuvers && Array.isArray(json.skillManeuvers)) {
    json.skillManeuvers.forEach((id: string) => {
      manobras_habilidade.push({
        id,
        nome: MANEUVER_NAMES[id] || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      });
    });
  }

  // Parse gifts
  const dons: Dom[] = [];
  if (json.gifts && Array.isArray(json.gifts)) {
    json.gifts.forEach((gift: any) => {
      dons.push({
        id: gift.id || '',
        nome: gift.name || gift.nome || '',
        descricao: gift.description || gift.descricao || '',
        categoria: gift.category || gift.categoria,
        custo_essencia: gift.essenceCost || gift.custo_essencia,
        nivel: gift.level || gift.nivel,
      });
    });
  }

  // Parse stress
  const stress_fisico = json.stress?.physical || json.stress_fisico || [false, false, false];
  const stress_mental = json.stress?.mental || json.stress_mental || [false, false, false];

  // Parse consequences
  const consequencias: Consequencia[] = [];
  if (json.consequences) {
    consequencias.push({ nivel: 'Suave (2)', descricao: json.consequences.mild || '' });
    consequencias.push({ nivel: 'Moderada (4)', descricao: json.consequences.moderate || '' });
    consequencias.push({ nivel: 'Grave (6)', descricao: json.consequences.severe || '' });
  } else {
    consequencias.push({ nivel: 'Suave (2)', descricao: '' });
    consequencias.push({ nivel: 'Moderada (4)', descricao: '' });
    consequencias.push({ nivel: 'Grave (6)', descricao: '' });
  }

  return {
    nome: json.name || json.nome || 'Personagem',
    drive: json.drive,
    aspectos,
    habilidades,
    manobras,
    manobras_habilidade,
    stress_fisico,
    stress_mental,
    consequencias,
    pontos_destino: json.fatePoints ?? json.pontos_destino ?? 3,
    pontos_destino_max: json.refresh ?? json.pontos_destino_max ?? 3,
    dons,
    notas: json.notes || json.notas || '',
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
      console.error('Error parsing JSON:', e);
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
          Formato esperado: JSON exportado do app iHunt
        </p>
      </div>
    </div>
  );
}
