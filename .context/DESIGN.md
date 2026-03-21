# Design Status

## Current Feature Set
- [x] **Core Mechanics**
    - [x] Placement Phase (3 pieces per player).
    - [x] Movement Phase (Adjacency-based).
    - [x] Win Condition (3-in-a-row).
    - [x] Draw Condition (3-fold repetition).
- [x] **AI Opponent**
    - [x] Alpha-Beta Pruning.
    - [x] In-place state mutation for reduced GC overhead.
    - [x] Heuristic-based evaluation (Center control + threat detection).
    - [x] Difficulty selector (5 levels: `PLEBEIAN`, `MERCHANT`, `EQUES`, `SENATOR`, `CONSUL`).
- [x] **Multiplayer**
    - [x] Supabase Realtime synchronization.
    - [x] Presence-based role assignment.
    - [x] Spectator mode support.
- [x] **UI/UX**
    - [x] "The Forum" theme implementation (Warm Stone, Pompeii Red, Mediterranean Blue).
    - [x] Responsive hex/circular board layout with sized breathing circle indicators.
    - [x] Rotating victory quotes for PvP modes with "smudge" highlight effect.
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
    - [x] **Haptics:** Synchronized physical vibrations via the Web Vibration API (`web-haptics`) matched to game materials (e.g. grinding stone, impacts) using a shared 4-state audio/haptics toggle control.

## Planned / In Progress
- [ ] **Leaderboard:** Persistent wins tracking via Supabase Database.
- [ ] **Reconnect Logic:** Handling transient disconnects in online games without losing state.

## Aesthetic Specification
- **Theme Name:** "The Forum"
- **Canvas / Background:** `var(--background)` (#F5F0E6 Warm Sand / #2C241B Dark Earth)
- **Primary:** `var(--primary)` (#9C382F Pompeii Red)
- **Secondary:** `var(--secondary)` (#2C5D8F Mediterranean Blue)
- **Motion:** Stiff springs for UI elements, damp springs for game pieces to simulate weight.
