# Architecture

## Tech Stack (2026 Context)
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4 (Native CSS variables, zero-runtime)
- **Animation:** Framer Motion 12+ (Layout animations, shared element transitions)
- **State Management:** React `useReducer`
- **Testing:** Vitest
- **AI Engine:** Pure TypeScript implementation of Minimax with Alpha-Beta Pruning (executed in a Web Worker).

## High-Level Structure
```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── game/             # Game-specific components (Board, Cell, Piece)
│   ├── ui/               # Reusable UI components (Button, Modal, GlassPanel)
│   └── ServiceWorkerRegister.tsx
├── lib/                  # Utilities and Logic
│   ├── game-logic.ts     # Core rules (move validation, win check)
│   ├── ai.ts             # CPU opponent logic (Minimax)
│   ├── utils.ts          # Utility functions (cn, etc.)
│   └── game-logic.test.ts # Unit tests for game logic
└── worker/               # Web Workers
    └── ai.worker.ts      # Worker entry point for AI calculations
```

## Data Flow
1.  **User Input:** Click/Tap events on the board.
2.  **Game Logic:** Validates move -> Updates State via `useReducer`.
3.  **UI Update:** React re-renders with new state -> Framer Motion animates transitions.
4.  **AI Turn (HvC):**
    - UI triggers Web Worker message with current state.
    - Worker runs Minimax algorithm (non-blocking).
    - Worker posts message back with best move.
    - UI dispatches `CPU_MOVE` action to update state.

## Key Design Decisions
- **Web Workers:** AI computation is offloaded to a worker thread to ensure the UI remains buttery smooth (60fps) even during complex Minimax calculations.
- **CSS-in-JS vs Utility:** Tailwind v4 is used for performance and maintainability, with complex animations handled by Framer Motion.
- **State Encapsulation:** Game logic is separated into pure functions in `src/lib/game-logic.ts` to facilitate testing and reuse in both the UI and the Web Worker.
