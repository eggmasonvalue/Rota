# Rota Web App

A modern, visually stunning implementation of the ancient Roman game **Rota**, built with Next.js 16, Tailwind CSS v4, and Framer Motion. The design features a **"The Forum"** aesthetic, blending classical Roman elements (Marcellus typography, Warm Stone palette) with modern glassmorphism.

## Features

- **Multi-Theme System:** Six immersive visual experiences:
  - **The Forum:** Warm Stone & Pompeii Red (Light/Dark).
  - **The Alabaster:** Pure White Marble & Indigo.
  - **The Serpentine:** Green Marble & Polished Silver.
  - **Vulcan's Forge:** Deep Grey & Fire Steel (Heliopolis).
  - **The Onyx:** Obsidian & Imperial Gold.
- **Sensory Feedback:** Procedural audio synthesis via the Web Audio API (stone/marble materials) paired with synchronized physical vibrations via the Web Vibration API (`web-haptics`), seamlessly unified under a 4-state toggle control.
- **Game Modes:**
  - **Human vs CPU:** Challenge a Minimax-powered AI with five distinct difficulty levels:
    - **Plebeian:** Basic moves, prone to error.
    - **Merchant:** Simple strategy.
    - **Eques:** Balanced challenge.
    - **Senator:** Strong tactical play.
    - **Consul:** Master-level foresight (Depth 4).
  - **Human vs Human:** Play against a friend on the same device.
  - **Online Multiplayer (Beta):** Play remotely via shareable links (Supabase Realtime).
- **Fluid Animations:** Smooth, 120fps transitions for piece placement and movement using Framer Motion.
- **Responsive Design:** Optimized for both desktop and mobile play with PWA support.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4 (Native CSS variables)
- **Animation:** Framer Motion 12
- **Sensory:** Web Audio API & Web Vibration API (`web-haptics`)
- **State Management:** React `useReducer`
- **Testing:** Vitest (Unit tests in `src/tests/`)
- **Performance:** Web Workers for AI computation utilizing in-place state mutation for reduced GC overhead.

## Getting Started

1.  **Install dependencies:**
    `npm install`

2.  **Run the development server:**
    `npm run dev &`

3.  **Open the app:**
    Navigate to http://localhost:3000 in your browser.

4.  **Run tests:**
    `npm test`

## How to Play

1.  **Placement Phase:** Players take turns placing 3 pieces each on the 9 available spots on the wheel.
2.  **Movement Phase:** Once all pieces are placed, players take turns moving one piece to an adjacent empty spot along the lines.
3.  **Winning:** The first player to align 3 of their pieces in a row (along a diameter or on the circle edge) wins.
4.  **Draws:** A draw is declared if the same board state repeats 3 times.

## Deployment

This project is configured for deployment on Netlify. See `netlify.toml` for configuration details.
