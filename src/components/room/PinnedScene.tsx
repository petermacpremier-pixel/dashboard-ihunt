import { useState } from 'react';
import { SceneInfo } from '@/types/ihunt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pin, Edit2, X, Check, Film, Plus, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinnedSceneProps {
  scene: SceneInfo | null;
  onUpdateScene: (scene: SceneInfo | null) => void;
  currentPlayerName: string;
}

export function PinnedScene({ scene, onUpdateScene, currentPlayerName }: PinnedSceneProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(scene?.title || '');
  const [description, setDescription] = useState(scene?.description || '');
  const [imageUrl, setImageUrl] = useState(scene?.imageUrl || '');
  const [aspects, setAspects] = useState<string[]>(scene?.aspects || []);
  const [newAspect, setNewAspect] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      onUpdateScene({
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        aspects: aspects.filter(a => a.trim()),
        pinnedBy: currentPlayerName,
        timestamp: new Date().toISOString(),
      });
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    onUpdateScene(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setAspects([]);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setTitle(scene?.title || '');
    setDescription(scene?.description || '');
    setImageUrl(scene?.imageUrl || '');
    setAspects(scene?.aspects || []);
    setIsEditing(true);
  };

  const addAspect = () => {
    if (newAspect.trim() && aspects.length < 6) {
      setAspects([...aspects, newAspect.trim()]);
      setNewAspect('');
    }
  };

  const removeAspect = (index: number) => {
    setAspects(aspects.filter((_, i) => i !== index));
  };

  if (isEditing) {
    return (
      <div className="p-3 border-b border-primary/30 bg-primary/5">
        <div className="space-y-3">
          <Input
            placeholder="Título da cena..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-sm font-semibold"
            autoFocus
          />
          <Textarea
            placeholder="Descrição da cena (local, situação, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
          />
          <div className="flex gap-2">
            <ImageIcon className="w-4 h-4 text-muted-foreground mt-2" />
            <Input
              placeholder="URL da imagem (opcional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="h-8 text-sm flex-1"
            />
          </div>
          
          {/* Aspects */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {aspects.map((aspect, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {aspect}
                  <button
                    onClick={() => removeAspect(i)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar aspecto de cena..."
                value={newAspect}
                onChange={(e) => setNewAspect(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAspect())}
                className="h-7 text-xs flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addAspect}
                disabled={!newAspect.trim() || aspects.length >= 6}
                className="h-7"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              <Check className="w-4 h-4 mr-1" />
              Fixar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!scene) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full p-2 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground text-sm"
      >
        <Pin className="w-4 h-4" />
        <span>Fixar cena ativa</span>
      </button>
    );
  }

  return (
    <div 
      className={cn(
        "border-b border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 relative group transition-all",
        isExpanded ? "p-4" : "p-3"
      )}
    >
      {/* Scene Image */}
      {scene.imageUrl && isExpanded && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img 
            src={scene.imageUrl} 
            alt={scene.title}
            className="w-full h-32 object-cover"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}

      <div className="flex items-start gap-2">
        {scene.imageUrl && !isExpanded && (
          <img 
            src={scene.imageUrl} 
            alt=""
            className="w-10 h-10 rounded object-cover flex-shrink-0"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        {!scene.imageUrl && (
          <Film className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        )}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h4 className="font-semibold text-sm text-primary truncate">
            {scene.title}
          </h4>
          {scene.description && (
            <p className={cn(
              "text-xs text-muted-foreground mt-0.5",
              isExpanded ? "" : "line-clamp-1"
            )}>
              {scene.description}
            </p>
          )}
          
          {/* Scene Aspects */}
          {scene.aspects && scene.aspects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {scene.aspects.map((aspect, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-[10px] py-0 h-5 border-primary/50 text-primary"
                >
                  {aspect}
                </Badge>
              ))}
            </div>
          )}
          
          <span className="text-[10px] text-muted-foreground/70 mt-1 block">
            por {scene.pinnedBy}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleStartEdit}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={handleClear}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}