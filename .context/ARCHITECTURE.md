# Architecture

## Technical Stack
- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Styling:** Tailwind CSS v4 (Using native CSS variables and `@theme` blocks)
- **Animation:** Framer Motion 12 (Layout transitions and spring physics)
- **Realtime:** Supabase (Presence and Broadcast Channels)
- **Audio:** Web Audio API (Synthesized procedural audio)
- **Testing:** Vitest for pure logic validation

## Core Modules
### 1. Game Engine (`src/lib/game-logic.ts`)
A pure, functional engine that manages the Rota state machine.
- **Adjacency Map:** Hardcoded graph representing the board connectivity (Outer ring + Center hub).
- **Validation:** Strict rules for placement and movement (must be adjacent, cannot jump).
- **State Management:** Driven by a `useReducer` hook in the main page component for predictable state transitions.

### 2. AI Opponent (`src/worker/ai.worker.ts` & `src/lib/ai.ts`)
A Minimax algorithm with Alpha-Beta pruning, offloaded to a Web Worker for zero-blocking UI.
- **Worker Entry:** `src/worker/ai.worker.ts` handles message passing.
- **Core Logic:** `src/lib/ai.ts` contains the pure Minimax implementation.
- **Heuristics:** 
    - **Center Control:** High weight (+20) for holding the center hub (point 8).
    - **Winning Threats:** Significant weight (+50) for 2-in-a-row with an empty third spot.
    - **Defensive Priority:** Penalty (-60) for opponent's 2-in-a-row threats.
- **Difficulty Scaling:** 
    - **Easy:** Depth 1 + 40% random move chance.
    - **Medium:** Depth 2.
    - **Senator (Hard):** Depth 4 (sufficient for Rota's small state space).

### 3. Multiplayer Sync (`src/hooks/useOnlineGame.ts`)
A custom hook leveraging Supabase Realtime.
- **Presence Sorting:** Roles (`PLAYER1`, `PLAYER2`, `SPECTATOR`) are determined by sorting users by their `joinedAt` timestamp in the presence state.
- **Broadcast Pattern:** Move actions are broadcasted as JSON payloads. The receiving client re-plays the action through their local reducer to ensure state consistency.

### 4. Audio Synthesis (`src/hooks/useSoundEffects.ts`)
A custom hook encapsulating procedural audio generation.
- **Oscillator Strategy:** Uses `triangle`, `sine`, and `sawtooth` waves for tonal sounds (chords, clicks).
- **Noise Synthesis:** Uses `AudioBuffer` filled with random values (White Noise) processed through a `BiquadFilterNode` (Bandpass) to simulate friction/scraping sounds for piece movement.
- **Context Management:** Lazily initializes `AudioContext` to comply with browser autoplay policies.
- **Integration:** Reacts to `state.history.length` and `state.winner` changes to trigger sounds, ensuring synchronization across all game modes (Local, AI, Online).
- **Persistence:** Mute preference is stored in `localStorage` under the key `rota_muted`.

## Data Flow
```
[User Interaction] -> [Action Dispatched] 
                           |
          -----------------------------------
          |                |                |
    [Local Reducer] -> [Supabase Broadcast] -> [Web Worker (AI)]
          |                |                |
    [State Update]    [Remote Peer Sync]    [CPU Action Received]
          |                |                |
    [React Render] <-------------------------
          |
    [Framer Motion Animate]
          |
    [Sound Effect Trigger (useEffect)]
```
