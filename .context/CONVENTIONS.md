# Coding Conventions

## General
- **Language:** TypeScript (Strict Mode). No `any`.
- **Formatting:** Prettier (default config).
- **Linting:** ESLint (Next.js core web vitals + strict type checking).

## React Components
- **Functional Components:** Use `const Component = () => {}` syntax.
- **Props:** Define interfaces for all props. Destructure props in the function signature.
- **Hooks:** Custom hooks for logic reuse (e.g., `useGameState`, `useAI`).
- **Composition:** Prefer composition over inheritance.

## Styling (Tailwind v4)
- **Utility-First:** Use utility classes for layout, spacing, and typography.
- **Design Tokens:** Use CSS variables for theme colors (Glassmorphism: background blur, translucency).
- **Ordering:** Follow a consistent class ordering (e.g., Layout -> Box Model -> Typography -> Visuals -> Interaction).

## Animation (Framer Motion)
- **declarative:** Use `initial`, `animate`, `exit` props.
- **Performance:** Animate `transform` and `opacity` properties primarily. Avoid layout thrashing.
- **Feedback:** All interactive elements must have hover/tap feedback (scale, glow).

## Comments
- **JSDoc:** Document complex logic (especially AI and game rules).
- **"Why" over "What":** Explain the *intent* behind non-obvious code.
