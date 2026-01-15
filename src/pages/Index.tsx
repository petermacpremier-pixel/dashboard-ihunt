import { useState, useEffect } from 'react';
import { JoinRoom } from '@/components/room/JoinRoom';
import { GameRoom } from '@/components/room/GameRoom';
import { getStoredValue, setStoredValue } from '@/hooks/useLocalStorage';

interface RoomSession {
  roomCode: string;
  password: string;
  playerName: string;
  isMaster: boolean;
  playerId: string;
}

const SESSION_KEY = 'ihunt_session';

const Index = () => {
  const [session, setSession] = useState<RoomSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = getStoredValue<RoomSession>(SESSION_KEY);
    if (savedSession) {
      setSession(savedSession);
    }
    setIsLoading(false);
  }, []);

  const handleJoin = (roomCode: string, password: string, playerName: string, isMaster: boolean) => {
    const playerId = crypto.randomUUID();
    const newSession: RoomSession = { roomCode, password, playerName, isMaster, playerId };
    setStoredValue(SESSION_KEY, newSession);
    setSession(newSession);
  };

  const handleLeave = () => {
    // Clear session but keep other data (messages, scene, sheet)
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore errors
    }
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (session) {
    return (
      <GameRoom
        roomCode={session.roomCode}
        password={session.password}
        playerName={session.playerName}
        isMaster={session.isMaster}
        onLeave={handleLeave}
      />
    );
  }

  return <JoinRoom onJoin={handleJoin} />;
};

export default Index;
