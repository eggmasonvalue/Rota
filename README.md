# Rota Web App

A modern, visually stunning implementation of the ancient Roman game **Rota**, built with Next.js 16, Tailwind CSS v4, and Framer Motion.

## Features

- **Glassmorphism UI:** sleek, translucent design with neon accents.
- **Game Modes:** Play against a smart AI (Minimax-powered) or challenge a friend in local multiplayer (Human vs Human).
- **Fluid Animations:** Smooth transitions for piece placement and movement.
- **Responsive:** Works beautifully on desktop and mobile.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 (Native variables)
- **Animation:** Framer Motion 12
- **Language:** TypeScript
- **State Management:** React useReducer

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

4.  Run tests:
    ```bash
    npm test
    ```

## How to Play

1.  **Placement Phase:** Players take turns placing 3 pieces each on the board.
2.  **Movement Phase:** Players take turns moving one piece to an adjacent empty spot.
3.  **Winning:** Get 3 of your pieces in a row (along a line or on the circle).
