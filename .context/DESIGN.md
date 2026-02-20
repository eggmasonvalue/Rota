# Design Status

## Features (V1)
- [x] **Game Engine**
    - [x] Board representation (Array/Graph)
    - [x] Move validation (Placement & Movement phases)
    - [x] Win condition detection (3-in-a-row)
    - [x] Turn management
- [x] **AI Opponent**
    - [x] Random Move (Easy) - *Integrated as base logic*
    - [x] Minimax Depth 3 (Medium/Hard) - *Implemented with Alpha-Beta Pruning*
- [x] **User Interface**
    - [x] Glassmorphism Board Design
    - [x] Glowing Pieces (Neon/Cyberpunk aesthetic)
    - [x] Animated Transitions (Placement, Movement, Win)
    - [ ] Difficulty Selector - *Fixed at Depth 3 for V1*
    - [x] Game Over Modal with "Play Again"
- [x] **Responsiveness**
    - [x] Mobile-first layout
    - [x] Touch targets optimization
- [ ] **Sound**
    - [ ] Subtle SFX for placement/movement (Deferred)

## Design System
- **Theme:** Dark Mode default. Deep void background.
- **Material:** "Glass" - High blur, low opacity white/blue backgrounds with thin borders.
- **Accent:** Neon Cyan (Player), Neon Magenta (CPU).
