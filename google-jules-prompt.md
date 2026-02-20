# Project: Rota Web App (Modern 2D)

## Objective
Build a complete, visually stunning, single-page web application for the ancient Roman game **Rota**. The goal is to create a "best-in-class" visual experience using modern web technologies (Feb 2026 standards), prioritizing aesthetic appeal and fluid animation over legacy browser support.

## Core Gameplay
**Game Rules:**
1.  **Board:** A wheel with 8 points on the circumference and 1 point in the center. Lines connect the center to all outer points, and the outer points form a circle.
2.  **Pieces:** 2 players (Human vs CPU), 3 pieces each.
3.  **Phase 1 (Placement):** Players take turns placing one piece on an empty spot until all 6 pieces are on the board.
4.  **Phase 2 (Movement):** Players take turns moving one piece to an adjacent empty spot (along a line).
5.  **Winning Condition:** First player to get 3 pieces in a row (either through the center diameter or along the circle edge).
6.  **Draw:** If a repetitive loop occurs (3x repetition), declare a draw or force a different move (optional complexity, for V1 just detect win).

## Technical Stack
- **Framework:** Next.js 16+ (App Router).
- **Styling:** Tailwind CSS v4 (Native variables, glassmorphism utilities).
- **Animation:** Framer Motion 12+ (For all state changes, layout shifts, and interactions).
- **Language:** TypeScript 6.x (Strict mode).
- **State:** React Context + useReducer.
- **AI:** Client-side Minimax algorithm (running in a Web Worker if possible, or optimized main thread).

## Visual Direction (Modern 2D)
- **Style:** "Glassmorphism" / "Neon Cyberpunk".
- **Palette:** Deep dark backgrounds (void/space), translucent glass panels for UI, glowing neon cyan (Player) vs neon magenta (CPU) for pieces.
- **Feedback:**
    - Hover effects: Intense glow/scale.
    - Move validation: Visual indicators for valid moves.
    - Win: Explosion of particles or massive bloom effect.

## Feature Requirements (V1)
1.  **Game Board:** Interactive SVG or HTML/CSS grid representing the Rota wheel.
2.  **Game Logic:**
    - Validates placement and movement rules.
    - Detects win conditions immediately.
    - Handles turn switching.
3.  **AI Opponent:**
    - **Easy:** Random valid moves.
    - **Medium:** Minimax (Depth 2).
    - **Hard:** Minimax (Depth 4+ with Alpha-Beta pruning).
4.  **UI Components:**
    - Difficulty selector (Glass dropdown or toggle).
    - "New Game" button.
    - Turn indicator (Whose turn is it?).
    - Win/Loss modal overlay.

## Architectural Guidelines
- **Directory Structure:**
  ```
  src/app/page.tsx       # Main Game View
  src/components/game/   # Board, Piece, Cell components
  src/lib/game-logic.ts  # Pure functions for Rota rules
  src/lib/ai.ts          # Minimax implementation
  ```
- **Performance:** Ensure animations are 60fps+. Use `transform` and `opacity`.

## Deliverables
Provide the full source code for the Next.js project, including `package.json`, configuration files, and all source components. Ensure the code is production-ready and follows the conventions defined in `.context/CONVENTIONS.md`.
