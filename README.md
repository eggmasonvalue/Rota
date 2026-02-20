# Rota Web App

A modern, visually stunning implementation of the ancient Roman game **Rota**, built with Next.js 16, Tailwind CSS v4, and Framer Motion. The design features an **"Imperial Senate"** aesthetic, blending classical Roman elements with modern glassmorphism.

## Features

- **Imperial Senate Theme:** A rich visual experience using Tyrian Purple (#66023C) and Imperial Gold (#D4AF37) on a Deep Marble background.
- **Game Modes:**
  - **Human vs CPU:** Challenge a Minimax-powered AI with three difficulty levels (Novice, Legionary, Senator). AI calculations run in a Web Worker for non-blocking performance.
  - **Human vs Human:** Play against a friend on the same device.
- **Fluid Animations:** Smooth, 60fps transitions for piece placement and movement using Framer Motion.
- **Responsive Design:** Optimized for both desktop and mobile play.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4 (Native CSS variables)
- **Animation:** Framer Motion 12
- **State Management:** React `useReducer`
- **Testing:** Vitest
- **Performance:** Web Workers for AI computation

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

4.  **Run tests:**
    ```bash
    npm test
    ```

## How to Play

1.  **Placement Phase:** Players take turns placing 3 pieces each on the 9 available spots on the wheel.
2.  **Movement Phase:** Once all pieces are placed, players take turns moving one piece to an adjacent empty spot along the lines.
3.  **Winning:** The first player to align 3 of their pieces in a row (along a diameter or on the circle edge) wins.
4.  **Draws:** A draw is declared if the same board state repeats 3 times.

## Deployment

This project is configured for deployment on Netlify. See `netlify.toml` for configuration details.
