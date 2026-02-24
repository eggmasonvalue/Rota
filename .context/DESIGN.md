# Design Status

## Current Feature Set
- [x] **Core Mechanics**
    - [x] Placement Phase (3 pieces per player).
    - [x] Movement Phase (Adjacency-based).
    - [x] Win Condition (3-in-a-row).
    - [x] Draw Condition (3-fold repetition).
- [x] **AI Opponent**
    - [x] Alpha-Beta Pruning (Depth 4).
    - [x] Heuristic-based evaluation (Center control + threat detection).
    - [x] Difficulty selector (Novice to Senator).
- [x] **Multiplayer**
    - [x] Supabase Realtime synchronization.
    - [x] Presence-based role assignment.
    - [x] Spectator mode support.
- [x] **UI/UX**
    - [x] "Imperial Senate" theme implementation.
    - [x] Responsive hex/circular board layout.
    - [x] Spring-based piece animations.
    - [x] **Soundscape:** Procedural audio synthesis via Web Audio API.
        - [x] *Placement:* Heavy, dull thud (stone on marble).
        - [x] *Movement:* Filtered white noise scrape + low frequency rumble (stone sliding on stone).
        - [x] *Victory/Defeat:* Resonant chords (Major/Minor) with sine wave purity.
        - [x] *UI:* Subtle stone taps.

## Planned / In Progress
- [ ] **Leaderboard:** Persistent wins tracking via Supabase Database.
- [ ] **Reconnect Logic:** Handling transient disconnects in online games without losing state.
- [ ] **Haptics:** Deferred until iOS WebKit supports `navigator.vibrate` or equivalent web haptic APIs.

## Aesthetic Specification
- **Theme Name:** "Imperial Senate"
- **Primary:** `var(--color-tyrian-purple)` (#66023C)
- **Secondary:** `var(--color-imperial-gold)` (#D4AF37)
- **Canvas:** `var(--color-deep-marble)` (#1A1A2E)
- **Motion:** Stiff springs for UI elements, damp springs for game pieces to simulate weight.
