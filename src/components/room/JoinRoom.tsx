import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skull, Users, Lock, User, Crown } from 'lucide-react';

interface JoinRoomProps {
  onJoin: (roomCode: string, password: string, playerName: string, isMaster: boolean) => void;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function JoinRoom({ onJoin }: JoinRoomProps) {
  const [createRoom, setCreateRoom] = useState({
    code: generateRoomCode(),
    password: '',
    playerName: '',
    isMaster: true,
  });

  const [joinRoom, setJoinRoom] = useState({
    code: '',
    password: '',
    playerName: '',
    isMaster: false,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (createRoom.password && createRoom.playerName) {
      onJoin(createRoom.code, createRoom.password, createRoom.playerName, createRoom.isMaster);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinRoom.code && joinRoom.password && joinRoom.playerName) {
      onJoin(joinRoom.code.toUpperCase(), joinRoom.password, joinRoom.playerName, joinRoom.isMaster);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-shadow-deep to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blood/5 via-transparent to-transparent" />
      
      <Card className="w-full max-w-md relative border-border/50 bg-card/80 backdrop-blur glow-blood">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center glow-blood">
            <Skull className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">iHunt VTT</CardTitle>
            <CardDescription className="text-muted-foreground">
              Mesa virtual para caçadores de monstros
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create" className="gap-2">
                <Crown className="w-4 h-4" />
                Criar Sala
              </TabsTrigger>
              <TabsTrigger value="join" className="gap-2">
                <Users className="w-4 h-4" />
                Entrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Seu Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="create-name"
                      placeholder="Nome do Mestre"
                      className="pl-10"
                      value={createRoom.playerName}
                      onChange={(e) => setCreateRoom({ ...createRoom, playerName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Código da Sala</Label>
                  <div className="flex gap-2">
                    <Input
                      value={createRoom.code}
                      readOnly
                      className="font-mono text-lg tracking-wider text-center bg-muted"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateRoom({ ...createRoom, code: generateRoomCode() })}
                    >
                      Novo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-password">Senha da Sala</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="create-password"
                      type="password"
                      placeholder="Defina uma senha"
                      className="pl-10"
                      value={createRoom.password}
                      onChange={(e) => setCreateRoom({ ...createRoom, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Crown className="w-4 h-4 mr-2" />
                  Criar Sala
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-name">Seu Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="join-name"
                      placeholder="Nome do Personagem"
                      className="pl-10"
                      value={joinRoom.playerName}
                      onChange={(e) => setJoinRoom({ ...joinRoom, playerName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="join-code">Código da Sala</Label>
                  <Input
                    id="join-code"
                    placeholder="XXXXXX"
                    className="font-mono text-lg tracking-wider text-center uppercase"
                    maxLength={6}
                    value={joinRoom.code}
                    onChange={(e) => setJoinRoom({ ...joinRoom, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="join-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="join-password"
                      type="password"
                      placeholder="Senha da sala"
                      className="pl-10"
                      value={joinRoom.password}
                      onChange={(e) => setJoinRoom({ ...joinRoom, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-warning" />
                    <Label htmlFor="is-master" className="cursor-pointer">Sou o Mestre</Label>
                  </div>
                  <Switch
                    id="is-master"
                    checked={joinRoom.isMaster}
                    onCheckedChange={(checked) => setJoinRoom({ ...joinRoom, isMaster: checked })}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Users className="w-4 h-4 mr-2" />
                  Entrar na Sala
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
