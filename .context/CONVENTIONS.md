# Coding Conventions

## TypeScript Standards
- **Strict Mode:** Absolutely no `any`. Use `unknown` or specific interfaces.
- **Discriminated Unions:** Always use discriminated unions for `Action` types in reducers.
- **Literal Types:** Prefer string literals for fixed states (e.g., `'PLAYER1' | 'PLAYER2'`).
- **Linter Errors:** Do not bypass or ignore `@typescript-eslint` or other linter warnings (e.g., via `@ts-ignore`). Use `@ts-expect-error` with a description if absolutely necessary.

## State Management
- **Immutability:** Never mutate the `board` array or `piecesCount` object directly in reducers. Use spread operators or `immer` if complexity grows.
- **Pure Functions:** Keep `game-logic.ts` pure. It should take a state and an action and return a new state without side effects.

## UI & Styling
- **Tailwind v4:** Leverage the new CSS-first configuration. Avoid legacy `tailwind.config.js`.
- **CSS Variables:** Define brand colors (Pompeii Red, Mediterranean Blue, Warm Stone, etc.) as CSS variables in `globals.css` for easy theme switching and support for The Forum theme.
- **Component Structure:**
    - `Board.tsx`: Container and layout.
    - `Cell.tsx`: Visual representation of a board point.
    - `Piece.tsx`: Interactive element with spring animations.
- **Typography:** The project heading typography uses the 'Marcellus' font from `next/font/google`.

## Realtime & Async
- **Web Workers:** Any function with high complexity (Minimax) must be called through `src/worker/ai.worker.ts`.
- **AI Performance:** Avoid expensive object cloning or serialization inside `src/lib/ai.ts`. Favor in-place mutation (`makeMove`) combined with backtracking (`undoMove`) to limit GC churn and speed up deep minimax evaluations.
- **Race Conditions:** Use `useRef` to track `sessionId` and `joinedAt` in the `useOnlineGame` hook to prevent stale closures during presence sync events.

## Audio & Haptics
- **Audio Context Setup:** Audio contexts should only be initialized (and resumed) strictly following user interactions via `async`/`await` initialization flows to satisfy browser autoplay policies.
- **Feedback Management:** Rely on `FeedbackMode` (`SOUND_AND_HAPTICS` | `SOUND_ONLY` | `HAPTICS_ONLY` | `OFF`) when triggering feedback to honor user preferences, persisted to `localStorage`.

## Documentation
- **JSDoc:** Required for the `evaluate` function in `ai.ts` and `ADJACENCY` map to explain scoring weights and graph connections.
