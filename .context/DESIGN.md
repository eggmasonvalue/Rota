# Design Status

## Features (V1)
- [x] **Game Engine**
    - [x] Board representation (Array/Graph)
    - [x] Move validation (Placement & Movement phases)
    - [x] Win condition detection (3-in-a-row)
    - [x] Draw detection (3-fold repetition)
    - [x] Blocked move detection (win/loss)
- [x] **AI Opponent**
    - [x] Minimax with Alpha-Beta Pruning (Web Worker)
    - [x] Difficulty Levels: Novice (Easy), Legionary (Medium), Senator (Hard)
- [x] **User Interface**
    - [x] "Imperial Senate" Theme (Glassmorphism + Roman Aesthetics)
    - [x] Game Modes: Human vs Human (HvH) & Human vs CPU (HvC)
    - [x] Animated Transitions (Placement, Movement, Win) using Framer Motion
    - [x] Game Over Modal with "Play Again"
- [x] **Responsiveness**
    - [x] Mobile-first layout
    - [x] Touch targets optimization
- [ ] **Sound**
    - [ ] Subtle SFX for placement/movement (Deferred)

## Design System
- **Theme:** "Imperial Senate" - A blend of classical Roman aesthetics and modern glassmorphism.
- **Colors:**
    - **Primary:** Tyrian Purple (#66023C) - Represents Player 1 / Royalty.
    - **Secondary:** Imperial Gold (#D4AF37) - Represents Player 2 / CPU / Wealth.
    - **Background:** Deep Marble (#1A1A2E) - Represents the Senate floor / Night.
- **Typography:**
    - **Headings:** Marcellus (Classical Roman serif).
    - **Body:** Lora (Elegant serif for readability).
