import { describe, it, expect, vi, beforeEach, mock, afterEach } from 'bun:test';
import { getBestMove } from '@/lib/ai';
import { INITIAL_STATE } from '@/lib/game-logic';

// Mock getBestMove
mock.module('@/lib/ai', () => ({
  getBestMove: vi.fn(),
}));

describe('AI Worker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // @ts-ignore
    global.postMessage = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Reset the mock implementation so it doesn't leak to other files
    // @ts-ignore
    getBestMove.mockImplementation(() => { return { from: null, to: 0 }; });
  });

  it('should post the move when calculation is successful', async () => {
    const mockMove = { from: null, to: 0 };
    // @ts-ignore
    getBestMove.mockReturnValue(mockMove);

    await import('../worker/ai.worker');

    const event = {
      data: {
        state: INITIAL_STATE,
        difficulty: 'PLEBEIAN'
      }
    };

    // @ts-ignore
    if (global.onmessage) {
      // @ts-ignore
      global.onmessage(event);
    } else if (self.onmessage) {
        // @ts-ignore
        self.onmessage(event);
    } else {
      throw new Error('onmessage not set by worker');
    }

    expect(getBestMove).toHaveBeenCalledWith(INITIAL_STATE, 'PLEBEIAN');
    // @ts-ignore
    expect(global.postMessage).toHaveBeenCalledWith({ move: mockMove });
  });

  it('should post an error when calculation fails', async () => {
    const mockError = new Error('AI Error');
    // @ts-ignore
    getBestMove.mockImplementation(() => {
      throw mockError;
    });

    await import('../worker/ai.worker');

    const event = {
      data: {
        state: INITIAL_STATE,
        difficulty: 'PLEBEIAN'
      }
    };

    // @ts-ignore
    if (global.onmessage) {
        // @ts-ignore
        global.onmessage(event);
    } else if (self.onmessage) {
        // @ts-ignore
        self.onmessage(event);
    } else {
      throw new Error('onmessage not set by worker');
    }

    expect(console.error).toHaveBeenCalledWith("AI Worker Error:", mockError);
    // @ts-ignore
    expect(global.postMessage).toHaveBeenCalledWith({
      move: null,
      error: 'Error: AI Error'
    });
  });
});
