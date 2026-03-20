import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBestMove } from '@/lib/ai';
import { INITIAL_STATE } from '@/lib/game-logic';

// Mock getBestMove
vi.mock('@/lib/ai', () => ({
  getBestMove: vi.fn(),
}));

describe('AI Worker', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error Mocking global function
    global.postMessage = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Reset the mock implementation so it doesn't leak to other files
    // @ts-expect-error Mocking getBestMove
    getBestMove.mockImplementation(() => { return { from: null, to: 0 }; });
  });

  it('should post the move when calculation is successful', async () => {
    const mockMove = { from: null, to: 0 };
    // @ts-expect-error Mocking getBestMove
    getBestMove.mockReturnValue(mockMove);

    await import('../worker/ai.worker');

    const event = {
      data: {
        state: INITIAL_STATE,
        difficulty: 'PLEBEIAN'
      }
    };

    // @ts-expect-error Testing global handler
    if (global.onmessage) {
      // @ts-expect-error Testing global handler
      global.onmessage(event);
    } else if (self.onmessage) {
        // @ts-expect-error Testing self handler
        self.onmessage(event);
    } else {
      throw new Error('onmessage not set by worker');
    }

    expect(getBestMove).toHaveBeenCalledWith(INITIAL_STATE, 'PLEBEIAN');
    // @ts-expect-error Testing global function
    expect(global.postMessage).toHaveBeenCalledWith({ move: mockMove });
  });

  it('should post an error when calculation fails', async () => {
    const mockError = new Error('AI Error');
    // @ts-expect-error Mocking getBestMove
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

    // @ts-expect-error Testing global handler
    if (global.onmessage) {
        // @ts-expect-error Testing global handler
        global.onmessage(event);
    } else if (self.onmessage) {
        // @ts-expect-error Testing self handler
        self.onmessage(event);
    } else {
      throw new Error('onmessage not set by worker');
    }

    expect(console.error).toHaveBeenCalledWith("AI Worker Error:", mockError);
    // @ts-expect-error Testing global function
    expect(global.postMessage).toHaveBeenCalledWith({
      move: null,
      error: 'Error: AI Error'
    });
  });
});