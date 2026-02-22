import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Action, Player } from '@/lib/game-logic';
import { RealtimeChannel } from '@supabase/supabase-js';

type PresenceUser = {
  sessionId: string;
  joinedAt: string;
  presence_ref: string;
};

export function useOnlineGame(
  roomId: string | null,
  onActionReceived: (action: Action, fromPlayer: Player) => void
) {
  const [myPlayer, setMyPlayer] = useState<Player | 'SPECTATOR' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionIdRef = useRef<string>('');
  const joinedAtRef = useRef<string>('');

  // Store the sorted list of players to determine roles
  const presenceListRef = useRef<PresenceUser[]>([]);

  // Initialize session ID once
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
      joinedAtRef.current = new Date().toISOString();
    }
  }, []);

  const sendAction = useCallback((action: Action) => {
    if (!channelRef.current || connectionStatus !== 'CONNECTED') return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'game_action',
      payload: { action, sessionId: sessionIdRef.current }
    });
  }, [connectionStatus]);

  useEffect(() => {
    if (!roomId) {
      setConnectionStatus('DISCONNECTED');
      setMyPlayer(null);
      setOnlineUsersCount(0);
      return;
    }

    setConnectionStatus('CONNECTING');

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: roomId,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const allUsers: PresenceUser[] = [];

        for (const key in state) {
          // Supabase types are a bit loose here, casting to expected shape
          const users = state[key] as unknown as PresenceUser[];
          allUsers.push(...users);
        }

        // Sort by joinedAt (Ascending) -> First one is Player 1
        allUsers.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
        presenceListRef.current = allUsers;

        setOnlineUsersCount(allUsers.length);

        // Determine my role
        const myIndex = allUsers.findIndex(u => u.sessionId === sessionIdRef.current);
        if (myIndex === 0) setMyPlayer('PLAYER1');
        else if (myIndex === 1) setMyPlayer('PLAYER2');
        else setMyPlayer('SPECTATOR');
      })
      .on('broadcast', { event: 'game_action' }, ({ payload }) => {
        const { action, sessionId } = payload;

        if (!action || !sessionId) return;

        // Determine who sent this action based on current presence list
        const senderIndex = presenceListRef.current.findIndex(u => u.sessionId === sessionId);
        let fromPlayer: Player | null = null;

        if (senderIndex === 0) fromPlayer = 'PLAYER1';
        else if (senderIndex === 1) fromPlayer = 'PLAYER2';

        if (fromPlayer) {
          onActionReceived(action, fromPlayer);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            sessionId: sessionIdRef.current,
            joinedAt: joinedAtRef.current,
          });
          setConnectionStatus('CONNECTED');
        } else if (status === 'CLOSED') {
          setConnectionStatus('DISCONNECTED');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, onActionReceived]);

  return { myPlayer, connectionStatus, onlineUsersCount, sendAction };
}
