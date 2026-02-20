# Architecture

## Tech Stack (2026 Context)
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript 6.x
- **Styling:** Tailwind CSS v4 (Native CSS variables, zero-runtime)
- **Animation:** Framer Motion 12+ (Layout animations, shared element transitions)
- **State Management:** React Context + `useReducer` (or Zustand if complexity grows)
- **AI Engine:** Pure TypeScript implementation of Minimax with Alpha-Beta Pruning (executed in a Web Worker to prevent UI blocking).

## High-Level Structure
```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── game/             # Game-specific components (Board, Piece, HUD)
│   ├── ui/               # Reusable UI components (Button, Modal, GlassPanel)
│   └── layout/           # Layout wrappers
├── lib/                  # Utilities and Logic
│   ├── game-logic.ts     # Core rules (move validation, win check)
│   ├── ai-engine.ts      # CPU opponent logic (Minimax)
│   └── animations.ts     # Animation variants and configs
└── styles/               # Global styles and Tailwind config
```

## Data Flow
1.  **User Input:** Click/Tap events on the board.
2.  **Game Logic:** Validates move -> Updates State.
3.  **UI Update:** React re-renders with new state -> Framer Motion animates transitions.
4.  **AI Turn:** If active, triggers Web Worker -> Calculates best move -> Updates State.

## Key Design Decisions
- **Web Workers:** AI computation is offloaded to a worker thread to ensure the UI remains buttery smooth (60fps) even during complex Minimax calculations.
- **CSS-in-JS vs Utility:** Tailwind v4 is used for performance and maintainability, with complex animations handled by Framer Motion.
