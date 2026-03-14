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
        Physical-world sound modelling — every sound based on stone/marble materials.
        Shared helpers: `playStoneResonance` (inharmonic sine pair @ 1.47× ratio + grit),
        `playImpactCrack` (highpass noise transient).
        - [x] *Placement:* Stone-on-marble "tok-click" (impact crack + inharmonic resonance + board thump).
        - [x] *Movement:* Stone-slide-and-settle (scraping texture sweep + sub-bass weight + delayed settle crack & tone).
        - [x] *Victory:* Triumphant ascending brass fanfare — 4-note C major phrase using filtered sawtooth (Roman tuba), culminating in sustained C5+G5 power chord (~3.5s).
        - [x] *Defeat:* Descending minor lament — 4-note falling phrase using muted horn (filtered sawtooth) + low drone (~3.5s). Breaks stone palette for tonal end-game signal.
        - [x] *Draw:* Suspended unresolved tones — tritone pair (B3+F4) using filtered triangle waves with vibrato, swelling and fading without resolution (~2.5s).
        - [x] *UI Click:* Small pebble tap on marble — bright, minimal.

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
