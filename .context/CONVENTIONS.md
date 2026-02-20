# Coding Conventions

## General
- **Language:** TypeScript (Strict Mode). No `any`.
- **Formatting:** Prettier (default config).
- **Linting:** ESLint (Next.js core web vitals + strict type checking).
- **Testing:** Unit tests (Vitest) should accompany core logic (`src/lib/game-logic.test.ts`).

## React Components
- **Functional Components:** Use `const Component = () => {}` syntax.
- **Props:** Define interfaces for all props. Destructure props in the function signature.
- **Hooks:** Custom hooks for logic reuse (e.g., `useGameState`, `useAI` if applicable).
- **Composition:** Prefer composition over inheritance.

## Styling (Tailwind v4)
- **Utility-First:** Use utility classes for layout, spacing, and typography.
- **Theme Colors:**
  - **Primary:** Tyrian Purple (#66023C)
  - **Secondary:** Imperial Gold (#D4AF37)
  - **Background:** Deep Marble (#1A1A2E)
- **Typography:**
  - **Headings:** Marcellus
  - **Body:** Lora
- **Utilities:** Use `cn` from `src/lib/utils.ts` for class merging and conditional classes.

## Animation (Framer Motion)
- **declarative:** Use `initial`, `animate`, `exit` props.
- **Performance:** Animate `transform` and `opacity` properties primarily. Avoid layout thrashing.
- **Feedback:** All interactive elements must have hover/tap feedback (scale, glow).

## Comments
- **JSDoc:** Document complex logic (especially AI and game rules).
- **"Why" over "What":** Explain the *intent* behind non-obvious code.
