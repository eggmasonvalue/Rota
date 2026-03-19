import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOnlineGame } from '../hooks/useOnlineGame';
import { supabase } from '../lib/supabase';
import { generateUUID } from '../lib/utils';
import { Action } from '../lib/game-logic';

// Mock dependencies
vi.mock('../lib/supabase', () => ({
  supabase: {
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

vi.mock('../lib/utils', () => ({
  generateUUID: vi.fn(),
  cn: vi.fn(),
}));

describe('useOnlineGame', () => {
  let mockChannel: any;
  let mockOnActionReceived: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock for generateUUID
    (generateUUID as any).mockReturnValue('test-session-id');

    // Setup mock for onActionReceived
    mockOnActionReceived = vi.fn();

    // Create a mock channel object with chainable methods
    mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      send: vi.fn(),
      track: vi.fn().mockResolvedValue(undefined),
      presenceState: vi.fn().mockReturnValue({}),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with disconnected state when roomId is null', () => {
    const { result } = renderHook(() => useOnlineGame(null, mockOnActionReceived));

    expect(result.current.connectionStatus).toBe('DISCONNECTED');
    expect(result.current.myPlayer).toBeNull();
    expect(result.current.onlineUsersCount).toBe(0);
    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('should attempt to connect when roomId is provided', () => {
    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    expect(result.current.connectionStatus).toBe('CONNECTING');
    expect(supabase.channel).toHaveBeenCalledWith('room:room-123', expect.any(Object));
    expect(mockChannel.on).toHaveBeenCalledWith('presence', { event: 'sync' }, expect.any(Function));
    expect(mockChannel.on).toHaveBeenCalledWith('broadcast', { event: 'game_action' }, expect.any(Function));
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should handle SUBSCRIBED status', async () => {
    // Intercept subscribe callback
    let subscribeCallback: (status: string) => void = () => {};
    mockChannel.subscribe.mockImplementation((cb: (status: string) => void) => {
      subscribeCallback = cb;
    });

    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    await act(async () => {
      subscribeCallback('SUBSCRIBED');
    });

    expect(mockChannel.track).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'test-session-id',
      joinedAt: expect.any(String),
    }));
    expect(result.current.connectionStatus).toBe('CONNECTED');
  });

  it('should handle CLOSED status', async () => {
    let subscribeCallback: (status: string) => void = () => {};
    mockChannel.subscribe.mockImplementation((cb: (status: string) => void) => {
      subscribeCallback = cb;
    });

    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    await act(async () => {
      subscribeCallback('CLOSED');
    });

    expect(result.current.connectionStatus).toBe('DISCONNECTED');
  });

  it('should determine myPlayer as PLAYER1 if first to join', async () => {
    let presenceSyncCallback: () => void = () => {};
    mockChannel.on.mockImplementation((event: string, opts: any, cb: any) => {
      if (event === 'presence' && opts.event === 'sync') {
        presenceSyncCallback = cb;
      }
      return mockChannel;
    });

    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    // Simulate presence state with only me
    mockChannel.presenceState.mockReturnValue({
      'room-123': [
        { sessionId: 'test-session-id', joinedAt: '2023-01-01T00:00:00.000Z', presence_ref: 'ref1' }
      ]
    });

    act(() => {
      presenceSyncCallback();
    });

    expect(result.current.onlineUsersCount).toBe(1);
    expect(result.current.myPlayer).toBe('PLAYER1');
  });

  it('should determine myPlayer as PLAYER2 if second to join', async () => {
    let presenceSyncCallback: () => void = () => {};
    mockChannel.on.mockImplementation((event: string, opts: any, cb: any) => {
      if (event === 'presence' && opts.event === 'sync') {
        presenceSyncCallback = cb;
      }
      return mockChannel;
    });

    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    // Simulate presence state with someone else first, then me
    mockChannel.presenceState.mockReturnValue({
      'room-123': [
        { sessionId: 'other-session', joinedAt: '2023-01-01T00:00:00.000Z', presence_ref: 'ref1' },
        { sessionId: 'test-session-id', joinedAt: '2023-01-01T00:00:01.000Z', presence_ref: 'ref2' }
      ]
    });

    act(() => {
      presenceSyncCallback();
    });

    expect(result.current.onlineUsersCount).toBe(2);
    expect(result.current.myPlayer).toBe('PLAYER2');
  });

  it('should determine myPlayer as SPECTATOR if third or later to join', async () => {
    let presenceSyncCallback: () => void = () => {};
    mockChannel.on.mockImplementation((event: string, opts: any, cb: any) => {
      if (event === 'presence' && opts.event === 'sync') {
        presenceSyncCallback = cb;
      }
      return mockChannel;
    });

    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    mockChannel.presenceState.mockReturnValue({
      'room-123': [
        { sessionId: 'player1-session', joinedAt: '2023-01-01T00:00:00.000Z', presence_ref: 'ref1' },
        { sessionId: 'player2-session', joinedAt: '2023-01-01T00:00:01.000Z', presence_ref: 'ref2' },
        { sessionId: 'test-session-id', joinedAt: '2023-01-01T00:00:02.000Z', presence_ref: 'ref3' }
      ]
    });

    act(() => {
      presenceSyncCallback();
    });

    expect(result.current.onlineUsersCount).toBe(3);
    expect(result.current.myPlayer).toBe('SPECTATOR');
  });

  it('should trigger onActionReceived on broadcast game_action', async () => {
    let presenceSyncCallback: () => void = () => {};
    let broadcastCallback: (payload: any) => void = () => {};

    mockChannel.on.mockImplementation((event: string, opts: any, cb: any) => {
      if (event === 'presence' && opts.event === 'sync') {
        presenceSyncCallback = cb;
      } else if (event === 'broadcast' && opts.event === 'game_action') {
        broadcastCallback = cb;
      }
      return mockChannel;
    });

    renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    // First setup presence so the hook knows who is PLAYER1 and PLAYER2
    mockChannel.presenceState.mockReturnValue({
      'room-123': [
        { sessionId: 'player1-session', joinedAt: '2023-01-01T00:00:00.000Z', presence_ref: 'ref1' },
        { sessionId: 'test-session-id', joinedAt: '2023-01-01T00:00:01.000Z', presence_ref: 'ref2' }
      ]
    });

    act(() => {
      presenceSyncCallback();
    });

    // Now simulate an incoming broadcast from PLAYER1
    const mockAction: Action = { type: 'PLACE', target: 0 };

    act(() => {
      broadcastCallback({
        payload: {
          action: mockAction,
          sessionId: 'player1-session'
        }
      });
    });

    expect(mockOnActionReceived).toHaveBeenCalledWith(mockAction, 'PLAYER1');
  });

  it('should ignore broadcasts from unknown sessions or spectators', async () => {
    let presenceSyncCallback: () => void = () => {};
    let broadcastCallback: (payload: any) => void = () => {};

    mockChannel.on.mockImplementation((event: string, opts: any, cb: any) => {
      if (event === 'presence' && opts.event === 'sync') {
        presenceSyncCallback = cb;
      } else if (event === 'broadcast' && opts.event === 'game_action') {
        broadcastCallback = cb;
      }
      return mockChannel;
    });

    renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    mockChannel.presenceState.mockReturnValue({
      'room-123': [
        { sessionId: 'player1-session', joinedAt: '2023-01-01T00:00:00.000Z', presence_ref: 'ref1' },
        { sessionId: 'player2-session', joinedAt: '2023-01-01T00:00:01.000Z', presence_ref: 'ref2' },
        { sessionId: 'spectator-session', joinedAt: '2023-01-01T00:00:02.000Z', presence_ref: 'ref3' }
      ]
    });

    act(() => {
      presenceSyncCallback();
    });

    // Simulate broadcast from spectator
    act(() => {
      broadcastCallback({
        payload: {
          action: { type: 'PLACE', target: 0 },
          sessionId: 'spectator-session'
        }
      });
    });

    expect(mockOnActionReceived).not.toHaveBeenCalled();

    // Simulate broadcast from unknown
    act(() => {
      broadcastCallback({
        payload: {
          action: { type: 'PLACE', target: 0 },
          sessionId: 'unknown-session'
        }
      });
    });

    expect(mockOnActionReceived).not.toHaveBeenCalled();
  });

  it('should send an action through the channel when sendAction is called and connected', async () => {
    let subscribeCallback: (status: string) => void = () => {};
    mockChannel.subscribe.mockImplementation((cb: (status: string) => void) => {
      subscribeCallback = cb;
    });

    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    // Call subscribe to set status to CONNECTED
    await act(async () => {
      subscribeCallback('SUBSCRIBED');
    });

    const action: Action = { type: 'PLACE', target: 4 };

    act(() => {
      result.current.sendAction(action);
    });

    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'game_action',
      payload: { action, sessionId: 'test-session-id' }
    });
  });

  it('should not send action if not connected', () => {
    const { result } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    // Status is currently CONNECTING
    act(() => {
      result.current.sendAction({ type: 'PLACE', target: 4 });
    });

    expect(mockChannel.send).not.toHaveBeenCalled();
  });

  it('should clean up the channel on unmount', () => {
    const { unmount } = renderHook(() => useOnlineGame('room-123', mockOnActionReceived));

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
