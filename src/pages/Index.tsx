import { useState } from 'react';
import { JoinRoom } from '@/components/room/JoinRoom';
import { GameRoom } from '@/components/room/GameRoom';

interface RoomSession {
  roomCode: string;
  password: string;
  playerName: string;
  isMaster: boolean;
}

const Index = () => {
  const [session, setSession] = useState<RoomSession | null>(null);

  const handleJoin = (roomCode: string, password: string, playerName: string, isMaster: boolean) => {
    setSession({ roomCode, password, playerName, isMaster });
  };

  const handleLeave = () => {
    setSession(null);
  };

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
