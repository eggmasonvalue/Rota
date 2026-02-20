import { getBestMove, Difficulty } from '@/lib/ai';
import { GameState } from '@/lib/game-logic';

self.onmessage = (event: MessageEvent) => {
  const { state, difficulty } = event.data as { state: GameState, difficulty: Difficulty };

  try {
    const move = getBestMove(state, difficulty);
    self.postMessage({ move });
  } catch (error) {
    console.error("AI Worker Error:", error);
    self.postMessage({ move: null, error: String(error) });
  }
};
