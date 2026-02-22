# Coding Conventions

## TypeScript Standards
- **Strict Mode:** Absolutely no `any`. Use `unknown` or specific interfaces.
- **Discriminated Unions:** Always use discriminated unions for `Action` types in reducers.
- **Literal Types:** Prefer string literals for fixed states (e.g., `'PLAYER1' | 'PLAYER2'`).

## State Management
- **Immutability:** Never mutate the `board` array or `piecesCount` object directly. Use spread operators or `immer` if complexity grows.
- **Pure Functions:** Keep `game-logic.ts` pure. It should take a state and an action and return a new state without side effects.

## UI & Styling
- **Tailwind v4:** Leverage the new CSS-first configuration. Avoid legacy `tailwind.config.js`.
- **CSS Variables:** Define brand colors (Tyrian Purple, Gold) as CSS variables in `globals.css` for easy theme switching.
- **Component Structure:**
    - `Board.tsx`: Container and layout.
    - `Cell.tsx`: Visual representation of a board point.
    - `Piece.tsx`: Interactive element with spring animations.

## Realtime & Async
- **Web Workers:** Any function with O(b^d) complexity (Minimax) must be called through `src/worker/ai.worker.ts`.
- **Race Conditions:** Use `useRef` to track `sessionId` and `joinedAt` in the `useOnlineGame` hook to prevent stale closures during presence sync events.

## Documentation
- **JSDoc:** Required for the `evaluate` function in `ai.ts` and `ADJACENCY` map to explain scoring weights and graph connections.
