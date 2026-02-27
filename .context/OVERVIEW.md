# Rota Web App - Overview

## Project Vision
To deliver a high-fidelity, interactive implementation of **Rota**, an ancient Roman strategy game, optimized for the 2026 web ecosystem. The project emphasizes a "Modern Antiquity" aesthetic—blending classical Roman visual cues (Marcellus typography, Warm Stone palette) with advanced web technologies (Next.js 16, Tailwind v4, Framer Motion 12).

## Core Gameplay Mechanics
Rota is a simplified relative of Nine Men's Morris, played on a circular board with 8 outer points and 1 central point (9 total).
- **Setup:** Each player starts with 3 pieces.
- **Phase 1 (Placement):** Players take turns placing their 3 pieces on any empty cell.
- **Phase 2 (Movement):** Once all pieces are placed, players take turns moving one piece to an adjacent empty cell.
- **Winning:** The first player to align 3 pieces in a straight line (including the center or across the outer circle) wins.
- **Draws:** Detected via 3-fold repetition of the board state or if a player is completely blocked from moving.

## Game Modes
- **Local (HvH):** Pass-and-play on a single device.
- **Vs CPU (HvC):** Single-player against a Minimax-driven AI with 5 selectable difficulty levels (`PLEBEIAN` to `CONSUL`).
- **Online (BETA):** Real-time multiplayer using Supabase Channels.

## Technical Philosophy
- **Zero-Blocking UI:** Heavy computations (AI Minimax) are offloaded to Web Workers to maintain a consistent 120fps (ProMotion/High-refresh support).
- **Synchronized State:** Multiplayer relies on a "Broadcast and Sync" pattern via Supabase Realtime, with role determination based on presence-joining timestamps.
- **Declarative Aesthetics:** All UI states and transitions are driven by React and Framer Motion, avoiding imperative DOM manipulation for a more maintainable codebase.
- **Synthesized Audio:** Game sound effects are procedurally generated using the Web Audio API, avoiding external asset dependencies and ensuring instant load times while maintaining the "Imperial Senate" theme.
- **Testable Architecture:** Unit tests for game logic and AI are strictly separated in `src/tests/` to maintain clean separation of concerns.

## Future Considerations
- **Haptics:** Deferred until iOS WebKit provides robust support for the Vibration API.
