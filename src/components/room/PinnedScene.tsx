import { useState } from 'react';
import { SceneInfo } from '@/types/ihunt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pin, Edit2, X, Check, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinnedSceneProps {
  scene: SceneInfo | null;
  onUpdateScene: (scene: SceneInfo | null) => void;
  currentPlayerName: string;
}

export function PinnedScene({ scene, onUpdateScene, currentPlayerName }: PinnedSceneProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(scene?.title || '');
  const [description, setDescription] = useState(scene?.description || '');

  const handleSave = () => {
    if (title.trim()) {
      onUpdateScene({
        title: title.trim(),
        description: description.trim(),
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
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setTitle(scene?.title || '');
    setDescription(scene?.description || '');
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="p-3 border-b border-primary/30 bg-primary/5">
        <div className="space-y-2">
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
    <div className="p-3 border-b border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 relative group">
      <div className="flex items-start gap-2">
        <Film className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-primary truncate">
            {scene.title}
          </h4>
          {scene.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {scene.description}
            </p>
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