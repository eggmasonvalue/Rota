# Remote Gameplay Evaluation: Human vs. Human

## Executive Summary

This report evaluates the feasibility of implementing **real-time Human vs. Human (HvH) gameplay** for the Rota Web App. The goal is to allow players to share a link and play instantly without login or persistence, hosted on the existing Netlify infrastructure.

**Recommendation:** **Option 2 (Supabase Realtime)** is the most balanced solution. It offers a robust free tier, minimal infrastructure setup (no custom server management), and fits the "share a link" requirement perfectly via ephemeral "channels" or "rooms".

**Alternative:** **Option 1 (PeerJS)** is a viable zero-cost alternative if strict $0 spend is required, but it suffers from reliability issues (NAT traversal, connection stability) that may degrade the user experience.

---

## Architecture Options

### Option 1: Peer-to-Peer (WebRTC via PeerJS)
Players connect directly to each other's browsers. A lightweight "signaling server" is needed only to establish the handshake.

*   **Pros:**
    *   **Lowest Cost:** No central server handles game data; only handshake metadata.
    *   **Privacy:** Data flows directly between players.
    *   **Serverless-friendly:** Can run entirely client-side after the initial handshake.
*   **Cons:**
    *   **Connectivity Issues:** Fails on restrictive networks (corporate firewalls, some mobile networks) without a TURN server (which costs money).
    *   **Latency/Stability:** Dependent on players' upload speeds.
    *   **Complexity:** Handling "host migration" if the host disconnects is difficult.
*   **Pricing:**
    *   **PeerServer Cloud:** Free (shared, rate-limited, no SLA).
    *   **Self-Hosted:** Free (MIT License), but requires hosting a Node.js server (e.g., on Render/Heroku free tiers).

### Option 2: Managed Realtime Service (Supabase Realtime)
A central service relays messages between players subscribing to the same "game room" channel.

*   **Pros:**
    *   **Reliability:** Uses WebSockets with automatic fallback/reconnection logic.
    *   **Simplicity:** No backend code required; logic remains in the frontend client.
    *   **State Sync:** "Presence" features make it easy to see if the other player is online.
*   **Cons:**
    *   **Quotas:** Free tier has limits (concurrent connections, message counts), though generous for a simple game.
*   **Pricing (Supabase):**
    *   **Free Tier:**
        *   200 concurrent peak connections.
        *   2 Million messages/month.
        *   $0/month.
    *   **Pro Plan:** $25/month for significantly higher limits.

### Option 3: WebSocket Edge Relay (PartyKit / Cloudflare Workers)
Deploy a custom WebSocket server to the edge (Cloudflare network) that manages game state.

*   **Pros:**
    *   **Performance:** Lowest latency, running on the edge.
    *   **Authoritative Server:** The server can validate moves, preventing cheating.
    *   **State Persistence:** Can hold game state in memory even if both players disconnect briefly.
*   **Cons:**
    *   **Deployment Complexity:** Requires a separate deployment process (Cloudflare Workers) in addition to Netlify.
    *   **Maintenance:** You own the server code and its maintenance.
*   **Pricing (Cloudflare Workers):**
    *   **Free:** 100,000 requests/day (generous).
    *   **Paid:** Starts at $5/month.

---

## Required Codebase Changes

The implementation will require refactoring the current `page.tsx` to separate the **Game Loop** from the **UI**, allowing the game to be driven by either a local reducer or a remote event stream.

### 1. Refactor: Decouple Game Logic
*   **Current:** `useReducer` in `page.tsx` directly manages state.
*   **New:** Extract `useGameEngine` hook.
    *   Accepts `mode: 'LOCAL' | 'REMOTE'`.
    *   Returns `gameState` and `dispatch` function.
    *   In `REMOTE` mode, `dispatch` sends events to the network instead of the local reducer.

### 2. New Hook: `useMultiplayer`
*   Manages the connection lifecycle (Connect -> Waiting -> Playing -> Disconnect).
*   Generates/Parses the "Game ID" from the URL (e.g., `?game=1234`).
*   Listens for remote events (`OPPONENT_MOVED`, `GAME_RESET`) and updates the local state.

### 3. UI Updates
*   **Lobby Overlay:** A screen state for "Creating Game..." and "Waiting for Opponent".
*   **Share Button:** A prominent button to copy the game link to the clipboard.
*   **Player Identification:** A simple mechanism to assign "Player 1" (Host) and "Player 2" (Joiner).

---

## Complexity Estimation

| Component | Estimate | Description |
| :--- | :--- | :--- |
| **State Refactoring** | **Medium** | Extracting `useReducer` logic is straightforward but requires care to not break existing AI modes. |
| **Network Layer** | **Medium** | Integrating Supabase Realtime is well-documented. Handling edge cases (disconnects) takes time. |
| **UI/UX Changes** | **Small** | Adding a "Share" modal and status indicators. |
| **Testing** | **Medium** | Testing real-time logic requires two browser windows/simulators. |
| **Total Effort** | **~2-3 Days** | A focused sprint to get a solid MVP running. |

## Implementation Plan (Recommended Path)

1.  **Step 1: Refactor** `src/app/page.tsx` to use a custom hook `useGameState`. Ensure current local/AI games work unchanged.
2.  **Step 2: Setup Supabase**. Create a project and enable Realtime. Add environment variables to Netlify/Local.
3.  **Step 3: Implement `useRemoteGame`**.
    *   On mount: Connect to Supabase channel `game_room_${roomId}`.
    *   Use `presence` to detect when a second player joins.
    *   Sync `INITIAL_STATE` from Host to Joiner.
    *   Broadcast `dispatch` actions to the channel.
4.  **Step 4: UI Integration**.
    *   Add "Play Online" button to the main menu (or a mode toggle).
    *   Show "Waiting for player..." until presence count is 2.
5.  **Step 5: Deploy & Verify**.
