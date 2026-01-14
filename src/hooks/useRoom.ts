import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, ChatMessage, CharacterSheet, DiceRollResult, SceneInfo } from '@/types/ihunt';

interface RoomState {
  players: Player[];
  messages: ChatMessage[];
  pinnedScene: SceneInfo | null;
  isConnected: boolean;
}

export function useRoom(roomCode: string, playerName: string, isMaster: boolean) {
  const [state, setState] = useState<RoomState>({
    players: [],
    messages: [],
    pinnedScene: null,
    isConnected: false,
  });
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const playerIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (!roomCode || !playerName) return;

    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        presence: {
          key: playerIdRef.current,
        },
        broadcast: {
          self: true,
        },
      },
    });

    channelRef.current = channel;

    // Handle presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const players: Player[] = Object.values(presenceState).flat().map((p: any) => ({
        id: p.id,
        name: p.name,
        isMaster: p.isMaster,
        sheet: p.sheet,
        online_at: p.online_at,
      }));
      setState(prev => ({ ...prev, players }));
    });

    // Handle broadcast messages
    channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
      const message = payload as ChatMessage;
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    });

    // Handle sheet updates
    channel.on('broadcast', { event: 'sheet_update' }, ({ payload }) => {
      const { playerId, sheet } = payload as { playerId: string; sheet: CharacterSheet };
      setState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === playerId ? { ...p, sheet } : p
        ),
      }));
    });

    // Handle scene updates
    channel.on('broadcast', { event: 'scene_update' }, ({ payload }) => {
      const scene = payload as SceneInfo | null;
      setState(prev => ({
        ...prev,
        pinnedScene: scene,
      }));
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          id: playerIdRef.current,
          name: playerName,
          isMaster,
          sheet: null,
          online_at: new Date().toISOString(),
        });
        setState(prev => ({ ...prev, isConnected: true }));
        
        // Send join message
        channel.send({
          type: 'broadcast',
          event: 'chat',
          payload: {
            id: crypto.randomUUID(),
            playerId: 'system',
            playerName: 'Sistema',
            content: `${playerName} entrou na sala`,
            type: 'system',
            timestamp: new Date().toISOString(),
          },
        });
      }
    });

    return () => {
      channel.send({
        type: 'broadcast',
        event: 'chat',
        payload: {
          id: crypto.randomUUID(),
          playerId: 'system',
          playerName: 'Sistema',
          content: `${playerName} saiu da sala`,
          type: 'system',
          timestamp: new Date().toISOString(),
        },
      });
      supabase.removeChannel(channel);
    };
  }, [roomCode, playerName, isMaster]);

  const sendMessage = useCallback((content: string) => {
    if (!channelRef.current) return;
    
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      playerId: playerIdRef.current,
      playerName,
      content,
      type: 'message',
      timestamp: new Date().toISOString(),
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: message,
    });
  }, [playerName]);

  const sendRoll = useCallback((rollResult: DiceRollResult, description?: string, isSecret?: boolean) => {
    if (!channelRef.current) return;
    
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      playerId: playerIdRef.current,
      playerName,
      content: description || 'Rolou os dados',
      type: 'roll',
      timestamp: new Date().toISOString(),
      rollResult,
      isSecret,
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: message,
    });
  }, [playerName]);

  const updateSheet = useCallback((sheet: CharacterSheet) => {
    if (!channelRef.current) return;

    // Update presence with new sheet
    channelRef.current.track({
      id: playerIdRef.current,
      name: playerName,
      isMaster,
      sheet,
      online_at: new Date().toISOString(),
    });

    // Broadcast sheet update
    channelRef.current.send({
      type: 'broadcast',
      event: 'sheet_update',
      payload: {
        playerId: playerIdRef.current,
        sheet,
      },
    });
  }, [playerName, isMaster]);

  const updateScene = useCallback((scene: SceneInfo | null) => {
    if (!channelRef.current) return;

    // Update local state immediately
    setState(prev => ({ ...prev, pinnedScene: scene }));

    // Broadcast scene update
    channelRef.current.send({
      type: 'broadcast',
      event: 'scene_update',
      payload: scene,
    });

    // Send system message about scene change
    if (scene) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'chat',
        payload: {
          id: crypto.randomUUID(),
          playerId: 'system',
          playerName: 'Sistema',
          content: `🎬 Nova cena: ${scene.title}`,
          type: 'system',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, []);

  return {
    ...state,
    playerId: playerIdRef.current,
    sendMessage,
    sendRoll,
    updateSheet,
    updateScene,
  };
}
