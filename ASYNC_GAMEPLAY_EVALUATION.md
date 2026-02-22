# Async Gameplay Evaluation: Human vs. Human

## Executive Summary

This report evaluates the feasibility of implementing **asynchronous Human vs. Human (HvH) gameplay** for the Rota Web App. This mode allows players to take turns at their own pace, sharing the game state via a link after each move.

**Recommendation:** **Option 2 (Ephemeral Key-Value Store with Upstash Redis)** is the most robust solution for a seamless "Share Link" experience. It keeps URLs short and user-friendly while avoiding the complexity of a full database.

**Alternative:** **Option 1 (State-in-URL)** is a zero-cost, zero-infrastructure solution. However, it requires players to manually copy and send a *new* link after every single move, which may be cumbersome for a game with frequent moves like Rota.

---

## Architecture Options

### Option 1: State-in-URL (The "Chess-by-Mail" Approach)
The entire game state is encoded (e.g., Base64 or simple query params) directly into the URL.
*   **Workflow:**
    1.  Player A makes a move.
    2.  The app generates a new URL containing the updated board state.
    3.  Player A copies this new URL and sends it to Player B (via SMS, WhatsApp, Discord, etc.).
    4.  Player B opens the link, sees the move, makes their own move, and sends the *new* resulting link back.
*   **Pros:**
    *   **Zero Infrastructure:** No database, no backend, no hosting costs.
    *   **Infinite History:** Every link represents a snapshot in time.
    *   **Privacy:** No data is stored on any server.
*   **Cons:**
    *   **User Friction:** Players *must* share the new link after every turn. If they forget, the game state is lost/desynchronized.
    *   **Cheating:** Easy to modify the URL parameters to change the board state (though validation logic can mitigate this).
    *   **Link Length:** URLs can become long (though Rota's state is small enough to fit easily within browser limits).

### Option 2: Ephemeral Key-Value Store (Upstash Redis)
Game state is stored in a cloud Redis instance, keyed by a unique `GameID`. The URL only contains this ID.
*   **Workflow:**
    1.  Player A starts a game; app creates a GameID and saves initial state to Redis.
    2.  Player A sends the link (e.g., `rota.game/play?id=123`) to Player B.
    3.  Player B opens the link. The app fetches the current state from Redis.
    4.  Player B makes a move. The app updates the state in Redis.
    5.  Player A (who still has the link open) can refresh (or poll) to see the new state.
*   **Pros:**
    *   **Persistent Link:** The URL never changes. Players use the same link for the entire match.
    *   **User Experience:** Much smoother than Option 1.
    *   **Simple State Management:** Key-Value lookups are fast and simple.
*   **Cons:**
    *   **External Dependency:** Requires an external service (Upstash).
*   **Pricing (Upstash):**
    *   **Free Tier:** 10,000 commands/day (plenty for thousands of daily games).
    *   **Pay-as-you-go:** Very cheap ($0.20 per 100k commands) if you exceed free limits.

### Option 3: Full Database (Supabase)
Similar to Option 2, but using a relational database (PostgreSQL) instead of Redis.
*   **Pros:**
    *   **Structured Data:** Easier to query game history, statistics, etc.
    *   **Real-time Potential:** Can easily upgrade to real-time later using Supabase Realtime (Subscription).
*   **Cons:**
    *   **Overkill:** A full SQL database is unnecessary for simple ephemeral game state.
    *   **Slower:** Slightly higher latency than Redis (though negligible for turn-based).
*   **Pricing (Supabase):**
    *   **Free Tier:** 500MB database, 2GB bandwidth. Very generous.

---

## Required Codebase Changes

### 1. Game State Hydration
*   **Current:** `initialState` is hardcoded in `useReducer`.
*   **New:**
    *   Check for `?gameId=` (Option 2/3) or `?state=` (Option 1) in URL on mount.
    *   If present, fetch/decode the state and initialize the reducer with it.

### 2. UI Updates for Async Flow
*   **"Waiting for Opponent" State:** When it's not the local player's turn, the board should be read-only.
*   **"Share Link" Action:**
    *   **Option 1:** A "Copy Move Link" button appears after every move.
    *   **Option 2/3:** A "Copy Game Link" button is always available.
*   **Notifications (Optional):** "Your turn!" indicator if the player keeps the tab open.

### 3. API Routes (For Option 2/3)
*   **`POST /api/game/create`**: Generates ID, saves initial state.
*   **`GET /api/game/[id]`**: Returns current state.
*   **`POST /api/game/[id]/move`**: Validates and applies move, updates state.

---

## Complexity Estimation

| Component | Estimate | Description |
| :--- | :--- | :--- |
| **State Hydration** | **Small** | Parsing URL params or fetching JSON is trivial. |
| **API Integration** | **Medium** | Setting up Redis/DB client and API routes (Next.js Server Actions). |
| **Validation** | **Medium** | Must ensure moves sent to the API are valid (prevent cheating). |
| **UI Polish** | **Small** | Adding "Copy Link" buttons and "Turn" indicators. |
| **Total Effort** | **~1-2 Days** | Simpler than real-time since no WebSocket connection management is needed.

## Recommendation

**DECISION: Option 2 (Upstash Redis) has been selected for implementation.**

For a **seamless async experience**, **Option 2 (Upstash Redis)** is the best choice. It balances implementation simplicity with a high-quality user experience (single persistent link).

If **zero cost/maintenance** is the absolute priority and slightly higher user friction is acceptable, **Option 1 (State-in-URL)** is a clever fallback that requires no backend at all.
