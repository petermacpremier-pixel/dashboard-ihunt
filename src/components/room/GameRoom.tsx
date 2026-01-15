import { useState } from 'react';
import { useRoom } from '@/hooks/useRoom';
import { Player, CharacterSheet } from '@/types/ihunt';
import { ChatPanel } from './ChatPanel';
import { PlayersList } from './PlayersList';
import { CharacterSheetView } from './CharacterSheetView';
import { SheetUploader } from './SheetUploader';
import { DownloadCodeButton } from '@/components/DownloadCodeButton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Skull, 
  Users, 
  MessageSquare, 
  FileText, 
  Copy, 
  Check,
  LogOut,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameRoomProps {
  roomCode: string;
  password: string;
  playerName: string;
  isMaster: boolean;
  onLeave: () => void;
}

export function GameRoom({ roomCode, password, playerName, isMaster, onLeave }: GameRoomProps) {
  const { players, messages, pinnedScene, isConnected, playerId, sendMessage, sendRoll, updateSheet, updateScene } = useRoom(
    roomCode,
    playerName,
    isMaster
  );
  
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const { toast } = useToast();

  const currentPlayer = players.find(p => p.id === playerId);

  const copyRoomInfo = () => {
    const info = `🎲 iHunt VTT\n\nCódigo: ${roomCode}\nSenha: ${password}`;
    navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copiado!',
      description: 'Informações da sala copiadas para a área de transferência.',
    });
  };

  const handleSheetUpload = (sheet: CharacterSheet) => {
    updateSheet(sheet);
  };

  const handleSheetUpdate = (sheet: CharacterSheet) => {
    updateSheet(sheet);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Skull className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-sm">iHunt VTT</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{roomCode}</span>
              <button
                onClick={copyRoomInfo}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DownloadCodeButton />
          
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{players.length}</span>
          </div>
          
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
          
          <Button variant="ghost" size="sm" onClick={onLeave}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1">
          {/* Left Panel - Players & Sheets */}
          <div className="w-80 border-r border-border flex flex-col bg-card/30">
            <Tabs defaultValue="players" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-4 grid grid-cols-2">
                <TabsTrigger value="players">Jogadores</TabsTrigger>
                <TabsTrigger value="mysheet">Minha Ficha</TabsTrigger>
              </TabsList>
              
              <TabsContent value="players" className="flex-1 overflow-auto m-0">
                <PlayersList 
                  players={players} 
                  currentPlayerId={playerId}
                  onSelectPlayer={setSelectedPlayer}
                />
              </TabsContent>
              
              <TabsContent value="mysheet" className="flex-1 overflow-auto m-0">
                <SheetUploader 
                  onUpload={handleSheetUpload}
                  currentSheet={currentPlayer?.sheet}
                />
                {currentPlayer?.sheet && (
                  <CharacterSheetView 
                    sheet={currentPlayer.sheet}
                    isEditable={true}
                    onUpdate={handleSheetUpdate}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Chat */}
          <div className="flex-1 flex flex-col">
            <ChatPanel 
              messages={messages}
              currentPlayerId={playerId}
              currentPlayerName={playerName}
              pinnedScene={pinnedScene}
              onSendMessage={sendMessage}
              onSendRoll={sendRoll}
              onUpdateScene={updateScene}
            />
          </div>

          {/* Right Panel - Selected Sheet */}
          <div className="w-96 border-l border-border bg-card/30">
            {selectedPlayer?.sheet ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold">Ficha de {selectedPlayer.name}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedPlayer(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <CharacterSheetView 
                    sheet={selectedPlayer.sheet}
                    isEditable={selectedPlayer.id === playerId}
                    onUpdate={selectedPlayer.id === playerId ? handleSheetUpdate : undefined}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center p-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Selecione um jogador para ver a ficha</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex lg:hidden flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-full m-0">
                <ChatPanel 
                  messages={messages}
                  currentPlayerId={playerId}
                  currentPlayerName={playerName}
                  pinnedScene={pinnedScene}
                  onSendMessage={sendMessage}
                  onSendRoll={sendRoll}
                  onUpdateScene={updateScene}
                />
              </TabsContent>
              
              <TabsContent value="players" className="h-full m-0 overflow-auto">
                <PlayersList 
                  players={players} 
                  currentPlayerId={playerId}
                  onSelectPlayer={(player) => {
                    setSelectedPlayer(player);
                    if (player.sheet) setActiveTab('sheet');
                  }}
                />
              </TabsContent>
              
              <TabsContent value="mysheet" className="h-full m-0 overflow-auto">
                <SheetUploader 
                  onUpload={handleSheetUpload}
                  currentSheet={currentPlayer?.sheet}
                />
                {currentPlayer?.sheet && (
                  <CharacterSheetView 
                    sheet={currentPlayer.sheet}
                    isEditable={true}
                    onUpdate={handleSheetUpdate}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="sheet" className="h-full m-0 overflow-auto">
                {selectedPlayer?.sheet ? (
                  <CharacterSheetView 
                    sheet={selectedPlayer.sheet}
                    isEditable={selectedPlayer.id === playerId}
                    onUpdate={selectedPlayer.id === playerId ? handleSheetUpdate : undefined}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Nenhuma ficha selecionada</p>
                  </div>
                )}
              </TabsContent>
            </div>
            
            <TabsList className="m-0 rounded-none border-t border-border grid grid-cols-4">
              <TabsTrigger value="chat" className="gap-1 data-[state=active]:bg-muted">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="players" className="gap-1 data-[state=active]:bg-muted">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Jogadores</span>
              </TabsTrigger>
              <TabsTrigger value="mysheet" className="gap-1 data-[state=active]:bg-muted">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Ficha</span>
              </TabsTrigger>
              <TabsTrigger value="sheet" className="gap-1 data-[state=active]:bg-muted" disabled={!selectedPlayer?.sheet}>
                <Skull className="w-4 h-4" />
                <span className="hidden sm:inline">Ver</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
