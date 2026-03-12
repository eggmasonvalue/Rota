# Changelog

## [Unreleased]
- **Theme Overhaul:** Replaced "Imperial Senate" (Tyrian Purple) with "The Forum" (Warm Stone / Pompeii Red) theme. Implemented light/dark mode support with semantic CSS variables.
- **Typography:** Updated to `Marcellus` for headings and `Merriweather` for body text.
- **AI Upgrade:** Expanded AI to 5 distinct difficulty levels (`PLEBEIAN`, `MERCHANT`, `EQUES`, `SENATOR`, `CONSUL`) with varying depth and strategic weighting.
- **UI Polish:**
    - Resized breathing circle indicators to match piece dimensions.
    - Implemented rotating victory quotes for PvP modes.
    - Added "smudge" highlight effect to victory numbers.
    - Removed obstructive glass containers from instruction text.
- **Code Quality:**
    - Improved test coverage for `isValidMovement` in `src/tests/game-logic.test.ts`.
    - Moved unit tests to a dedicated `src/tests/` directory.
    - Fixed hardcoded colors in generated assets (`icon.tsx`, `manifest.ts`, etc.).
    - Removed leftover debug `console.log` statements from the main game component.
- **Soundscape:** Implemented procedural audio synthesis for game actions (Placement, Movement, Win/Loss/Draw) and UI interactions. Sounds are designed to fit the theme (stone thuds, sliding clacks).
- **Performance Optimization:** Optimized audio engine by caching noise buffers, reducing main-thread overhead during gameplay.
- **Haptics:** Deferred implementation until iOS WebKit provides robust support for the Vibration API.
- Integrated Supabase Realtime for Online Multiplayer (BETA).
- Added `useOnlineGame` hook to manage synchronized game state.
- Implemented "Human vs Human" (HvH) game mode for local multiplayer.
- Optimized animation performance with Framer Motion.

## [0.1.1] - 2026-02-18
- Implemented Difficulty Selector (Easy/Medium/Hard).
- Implemented 3-fold repetition detection for Draws.
- Implemented Blocked Move detection (win condition for opponent).
- Offloaded AI computation to a Web Worker for smoother UI.
- Improved AI heuristic to detect 2-in-a-row threats.

## [0.1.0] - 2026-02-18
- Initial release of Rota Web App V1.
- Implemented game core logic (Placement, Movement, Win/Loss).
- Implemented Minimax AI with Alpha-Beta pruning (Depth 3).
- Implemented Glassmorphism UI using Tailwind CSS v4 and Framer Motion.
- Added responsive Board and Game Components.
