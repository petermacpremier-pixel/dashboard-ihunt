import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Code, Github, Download, ExternalLink } from 'lucide-react';

export function DownloadCodeButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">Código</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Código Open Source
          </DialogTitle>
          <DialogDescription>
            Este projeto é open source! Você pode acessar o código fonte de várias formas:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Github className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">GitHub</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  O código está sincronizado com GitHub. Acesse o repositório para clonar, fazer fork ou baixar o ZIP.
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Acessar GitHub
            </Button>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Download ZIP</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Para baixar o código como ZIP, acesse o repositório no GitHub e clique em "Code" → "Download ZIP".
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            <p>
              <strong>iHunt VTT</strong> é um projeto open source para o RPG iHunt.
            </p>
            <p className="mt-1">
              Licença MIT - Use, modifique e distribua livremente!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}