# Rota Web App - Overview

## Project Vision
To deliver a high-fidelity, interactive implementation of **Rota**, an ancient Roman strategy game, optimized for the 2026 web ecosystem. The project emphasizes a "Modern Antiquity" aesthetic—blending classical Roman visual cues with advanced web technologies. The experience features six immersive themes (The Forum, Alabaster, Serpentine, Onyx, Vulcan) ranging from sun-drenched marble to obsidian treasury vaults.

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
- **Zero-Blocking UI:** Heavy computations (AI Minimax) are offloaded to Web Workers to maintain a consistent 120fps (ProMotion/High-refresh support). AI optimizations (in-place state mutation) are used to prevent GC spikes.
- **Synchronized State:** Multiplayer relies on a "Broadcast and Sync" pattern via Supabase Realtime, with role determination based on presence-joining timestamps.
- **Declarative Aesthetics:** All UI states and transitions are driven by React and Framer Motion, avoiding imperative DOM manipulation for a more maintainable codebase. The theme system is implemented via `data-theme` on the root element for efficient, zero-flash transitions.
- **Sensory Feedback:** Game feedback integrates procedural audio and physical haptics in a unified 4-state system (`SOUND_AND_HAPTICS`, `SOUND_ONLY`, `HAPTICS_ONLY`, `OFF`).
  - **Synthesized Audio:** Uses physical-world sound modelling via the Web Audio API — all sounds derive from a stone/marble material palette. No external audio files; instant load times.
  - **Haptics:** Leverages the Web Vibration API (`web-haptics`) to provide synchronized physical feedback matching the materials (e.g. grinding stone, impacts).
- **Testable Architecture:** Unit tests for game logic and AI are strictly separated in `src/tests/` to maintain clean separation of concerns.
