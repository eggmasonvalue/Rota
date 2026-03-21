# Changelog

## [1.0.0]
- **UI Polish:**
    - Redesigned the online status bar to compactly display both players' ELO synchronized via real-time presence without bleeding to multiple lines.
    - Implemented a splash/loading overlay using an animated `RankIcon` to gracefully mask `localStorage` data loading and prevent flashes of default state.
    - Updated `RankIcon` to support an independent `hubColorClass` variable, allowing the icon to precisely match the actual application colors (`icon.tsx`).
- **Fix: First-load double-sound on solo mode first placement:** `initAudio()` was calling `AudioContext.resume()` fire-and-forget (no `await`). On the very first user interaction Chrome's autoplay policy leaves the context `suspended`, so `ctx.currentTime` was still `0` when nodes were scheduled — they would replay/flush later when the AI move triggered a second `resume()`, causing two sounds in quick succession. Fixed by making `initAudio` `async`, properly `await`ing `resume()`, and returning a `boolean` guard. All `playX` functions now `await initAudio()` before scheduling any nodes.
- **Fix: Draw detection (threefold repetition off-by-one):** `checkRepetition` was being called with the *pre-append* history (`newState.history`) instead of the fully-updated `newHistory`, causing draws to trigger one move too late (4th occurrence instead of 3rd). Fixed by passing `newHistory` to `checkRepetition` and raising the internal threshold from `>= 2` to `>= 3` to match the new invariant. Updated unit tests accordingly.
- **Fix: Flash of Incorrect Theme on Reload:** Moved theme initialisation from a React `useEffect` (post-hydration) to a blocking inline `<script>` in `<head>` that runs synchronously before the first paint. Removed the always-on body `transition` and replaced it with a `.theme-ready` class added after mount, so smooth transitions still fire on user-triggered toggles only.
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
    - Added comprehensive unit tests for `src/worker/ai.worker.ts` covering success and error handling scenarios.
    - Moved unit tests to a dedicated `src/tests/` directory.
    - Fixed hardcoded colors in generated assets (`icon.tsx`, `manifest.ts`, etc.).
    - Removed leftover debug `console.log` statements from the main game component.
- **Soundscape Overhaul:** Complete redesign of all procedural audio. Introduced physical-world sound modelling with shared helpers (`playStoneResonance`, `playImpactCrack`). All sounds now based on stone/marble material palette:
    - *Placement:* Stone-on-marble with inharmonic resonance (×1.47 ratio) + grit + board thump.
    - *Movement:* Scraping texture sweep → settle crack + mineral resonance.
    - *Victory:* Triumphant ascending brass fanfare — C major filtered sawtooth + power chord sustain. Mirrors defeat (same horn family, opposite mood).
    - *Defeat:* Descending minor lament — muted horn (filtered sawtooth) + low drone. Breaks stone palette for clear end-game signal.
    - *Draw:* Suspended unresolved tritone pair (filtered triangle waves with vibrato).
    - *UI Click:* Pebble tap using same stone palette.
- **Performance Optimization:** Optimized audio engine by caching noise buffers, reducing main-thread overhead during gameplay.
- **Haptics:** Deferred implementation until iOS WebKit provides robust support for the Vibration API.
- Integrated Supabase Realtime for Online Multiplayer (BETA).
- Added `useOnlineGame` hook to manage synchronized game state.
- Implemented "Human vs Human" (HvH) game mode for local multiplayer.
- Optimized animation performance with Framer Motion.
- **Performance Optimization (AI):** Reduced memory allocation and GC overhead in the minimax search by implementing in-place state mutation with backtracking (`makeMove`/`undoMove`). This replaced unnecessary object spreading and array copying in `src/lib/ai.ts`, resulting in a ~30% improvement in search speed at the `CONSUL` difficulty level.
- **Local Scoring System:**
    - Implemented a local Scoring System (Elo Rating) for Solo (HvC) games.
    - Created `src/lib/scoring.ts` to manage Elo calculations, Rank information, and fixed AI ratings.
    - Added a "Daily Triumph" continuous win streak tracking system.
    - Created `usePlayerStats` hook for managing and persisting stats in `localStorage` (`rota_player_stats`).
    - Built `PlayerStatsModal` component for viewing a detailed breakdown of W/L/D and streaks against each AI difficulty.
    - Added a compact, colored `RankIcon` SVG component for the top bar badge and modal legends.
    - Integrated the unified stats badge `[<RankIcon> ELO | 🔥 Streak]` into `src/app/page.tsx`.

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
