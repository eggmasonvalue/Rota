import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSoundEffects } from '../hooks/useSoundEffects';

// Mock web-haptics
const mockTrigger = vi.fn();
vi.mock('web-haptics/react', () => ({
  useWebHaptics: () => ({
    trigger: mockTrigger
  })
}));

// --- Mocks ---
class MockAudioNode {
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  disconnect = vi.fn();
  type = 'sine';
  frequency = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn()
  };
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn()
  };
  Q = { value: 0 };
  buffer = null;
}

class MockAudioContext {
  state = 'suspended';
  currentTime = 0;
  sampleRate = 44100;
  destination = {};

  resume = vi.fn().mockImplementation(async () => {
    this.state = 'running';
  });

  suspend = vi.fn().mockImplementation(async () => {
    this.state = 'suspended';
  });

  createOscillator = vi.fn(() => new MockAudioNode());
  createGain = vi.fn(() => new MockAudioNode());
  createBiquadFilter = vi.fn(() => new MockAudioNode());
  createBufferSource = vi.fn(() => new MockAudioNode());

  createBuffer = vi.fn((_channels: number, size: number) => ({
    getChannelData: vi.fn(() => new Float32Array(size))
  }));
}

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value.toString();
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  })
};

describe('useSoundEffects', () => {
  let originalAudioContext: typeof AudioContext;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockTrigger.mockClear();
    mockLocalStorage.clear();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock AudioContext
    originalAudioContext = window.AudioContext;
    Object.defineProperty(window, 'AudioContext', {
      value: MockAudioContext,
      writable: true,
      configurable: true
    });

    // Polyfill webkitAudioContext as well just in case
    Object.defineProperty(window, 'webkitAudioContext', {
      value: MockAudioContext,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Restore mocks
    Object.defineProperty(window, 'AudioContext', {
      value: originalAudioContext,
      writable: true,
      configurable: true
    });
    if ('webkitAudioContext' in window) {
      Object.defineProperty(window, 'webkitAudioContext', {
        value: undefined,
        writable: true,
        configurable: true
      });
    }
  });

  describe('Initialization & State Management', () => {
    it('initializes with default feedback mode SOUND_AND_HAPTICS', async () => {
      const { result } = renderHook(() => useSoundEffects());

      // Wait for the setTimeout in useEffect to complete
      await waitFor(() => {
        expect(result.current.isMounted).toBe(true);
      });

      expect(result.current.feedbackMode).toBe('SOUND_AND_HAPTICS');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('rota_feedback_mode');
    });

    it('loads saved feedback mode from localStorage', async () => {
      mockLocalStorage.setItem('rota_feedback_mode', 'HAPTICS_ONLY');
      const { result } = renderHook(() => useSoundEffects());

      await waitFor(() => {
        expect(result.current.isMounted).toBe(true);
      });

      expect(result.current.feedbackMode).toBe('HAPTICS_ONLY');
    });

    it('migrates legacy rota_muted flag to OFF', async () => {
      mockLocalStorage.setItem('rota_muted', 'true');
      const { result } = renderHook(() => useSoundEffects());

      await waitFor(() => {
        expect(result.current.isMounted).toBe(true);
      });

      expect(result.current.feedbackMode).toBe('OFF');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('rota_muted');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('rota_muted');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rota_feedback_mode', 'OFF');
    });

    it('migrates legacy rota_muted flag (false) to SOUND_AND_HAPTICS', async () => {
      mockLocalStorage.setItem('rota_muted', 'false');
      const { result } = renderHook(() => useSoundEffects());

      await waitFor(() => {
        expect(result.current.isMounted).toBe(true);
      });

      expect(result.current.feedbackMode).toBe('SOUND_AND_HAPTICS');
    });

    it('cycles through feedback modes correctly', async () => {
      const { result } = renderHook(() => useSoundEffects());

      await waitFor(() => {
        expect(result.current.isMounted).toBe(true);
      });

      expect(result.current.feedbackMode).toBe('SOUND_AND_HAPTICS');

      act(() => { result.current.cycleFeedbackMode(); });
      expect(result.current.feedbackMode).toBe('SOUND_ONLY');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('rota_feedback_mode', 'SOUND_ONLY');

      act(() => { result.current.cycleFeedbackMode(); });
      expect(result.current.feedbackMode).toBe('HAPTICS_ONLY');

      act(() => { result.current.cycleFeedbackMode(); });
      expect(result.current.feedbackMode).toBe('OFF');

      act(() => { result.current.cycleFeedbackMode(); });
      expect(result.current.feedbackMode).toBe('SOUND_AND_HAPTICS');
    });
  });

  describe('Audio & Haptics Playing', () => {
    it('stops audio buffers correctly when playing sound effects', async () => {
      // Create a specific MockAudioContext for this test so we can track nodes it creates
      const createdNodes: MockAudioNode[] = [];
      const mockCtx = new MockAudioContext();

      mockCtx.createOscillator = vi.fn(() => {
        const node = new MockAudioNode();
        createdNodes.push(node);
        return node;
      });
      mockCtx.createBufferSource = vi.fn(() => {
        const node = new MockAudioNode();
        createdNodes.push(node);
        return node;
      });

      const audioContextConstructorSpy = vi.fn().mockImplementation(function() { return mockCtx; });
      Object.defineProperty(window, 'AudioContext', { value: audioContextConstructorSpy, writable: true, configurable: true });

      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playPlace();
      });

      // Verify that at least one node has stop() called
      const hasStopCalled = createdNodes.some(node => vi.mocked(node.stop).mock.calls.length > 0);
      expect(hasStopCalled).toBe(true);
    });

    it('plays sound and haptic when placing piece', async () => {
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playPlace();
      });

      expect(mockTrigger).toHaveBeenCalledWith('medium');

      // Since it creates AudioContext and calls methods
      // Let's verify some AudioContext mocks were called by spying on the MockAudioContext prototype indirectly
      // Note: we can't easily spy on the specific instance methods unless we intercept the constructor,
      // but we can verify it by checking that no errors were thrown and vibrate was called.
    });

    it('plays sound and haptic when moving piece', async () => {
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playMove();
      });

      expect(mockTrigger).toHaveBeenCalledWith('light');
    });

    it('plays sound and haptic for victory', async () => {
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playWin();
      });

      expect(mockTrigger).toHaveBeenCalledWith('success');
    });

    it('plays sound and haptic for defeat', async () => {
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playLoss();
      });

      expect(mockTrigger).toHaveBeenCalledWith('error');
    });

    it('plays sound and haptic for draw', async () => {
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playDraw();
      });

      expect(mockTrigger).toHaveBeenCalledWith('warning');
    });

    it('plays sound and haptic for click', async () => {
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playClick();
      });

      expect(mockTrigger).toHaveBeenCalledWith('selection');
    });

    it('suppresses haptics in SOUND_ONLY mode', async () => {
      mockLocalStorage.setItem('rota_feedback_mode', 'SOUND_ONLY');
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      await act(async () => {
        await result.current.playClick();
      });

      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('suppresses sound in HAPTICS_ONLY mode', async () => {
      mockLocalStorage.setItem('rota_feedback_mode', 'HAPTICS_ONLY');
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      // Replace MockAudioContext with a spy wrapper to track instantiation
      const originalMock = MockAudioContext;
      const audioContextConstructorSpy = vi.fn().mockImplementation(function() { return new originalMock(); });
      Object.defineProperty(window, 'AudioContext', { value: audioContextConstructorSpy, writable: true, configurable: true });

      await act(async () => {
        await result.current.playWin();
      });

      // Haptics still happen
      expect(mockTrigger).toHaveBeenCalledWith('success');

      // But AudioContext is never initialized/used because sound is disabled
      expect(audioContextConstructorSpy).not.toHaveBeenCalled();
    });

    it('suppresses both in OFF mode', async () => {
      mockLocalStorage.setItem('rota_feedback_mode', 'OFF');
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      const audioContextConstructorSpy = vi.fn().mockImplementation(function() { return new MockAudioContext(); });
      Object.defineProperty(window, 'AudioContext', { value: audioContextConstructorSpy, writable: true });

      await act(async () => {
        await result.current.playLoss();
        await result.current.playDraw();
      });

      expect(mockTrigger).not.toHaveBeenCalled();
      expect(audioContextConstructorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Event Listeners & Context Management', () => {
    it('adds and removes visibility, focus, and pointerdown listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const windowAddEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useSoundEffects());

      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), { once: false });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });

    it('resumes audio context when tab becomes visible', async () => {
      // First, play a sound to initialize the audio context
      const { result } = renderHook(() => useSoundEffects());
      await waitFor(() => expect(result.current.isMounted).toBe(true));

      // We need to capture the AudioContext instance to check if resume was called
      let audioCtxInstance: MockAudioContext | null = null;
      const mockAudioCtxConstructor = vi.fn().mockImplementation(function() {
        audioCtxInstance = new MockAudioContext();
        return audioCtxInstance;
      });
      Object.defineProperty(window, 'AudioContext', { value: mockAudioCtxConstructor, writable: true, configurable: true });

      await act(async () => {
        await result.current.playClick();
      });

      expect(audioCtxInstance).not.toBeNull();
      if (!audioCtxInstance) return; // For TypeScript

      // Suspend it manually to simulate backgrounding
      (audioCtxInstance as unknown as { state: string }).state = 'suspended';
      const resumeSpy = vi.spyOn(audioCtxInstance, 'resume');

      // Trigger visibilitychange
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(resumeSpy).toHaveBeenCalled();
    });
  });
});
