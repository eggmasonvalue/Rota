# Security Policy

## Supported Versions

The following versions of the project are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report vulnerabilities by opening an issue on the repository. We aim to address critical security issues within 48 hours.

## Architecture & Trust Model

This application is a **Client-Side Authoritative** multiplayer game using Supabase Realtime as a relay.

### Trust Boundaries
- **No Backend Validation**: Game logic (move validation, win conditions) is executed entirely on the client.
- **Client-Side Authority**: The application trusts the state and actions broadcasted by connected peers. A malicious client could:
    - Send invalid moves (which honest clients will reject locally).
    - Spoof their identity (Player 1 vs Player 2) by manipulating the `sessionId` in the payload.
    - Manipulate their `joinedAt` timestamp to force a specific role (Player 1).

### Mitigation
- **Ephemeral Sessions**: Game rooms are temporary and URL-based. There is no persistent user data or login system to compromise.
- **Honest Client Validation**: While a malicious client can send invalid moves, the honest client (the victim) will validate all incoming actions against the game rules in `src/lib/game-logic.ts`. If an action is invalid, it is ignored, preventing the game state from being corrupted on the victim's screen.
- **Role Assignment**: Roles are assigned based on the `joinedAt` timestamp claimed by the client. In a casual gaming context, this is an acceptable trade-off for a serverless architecture.

## Configuration

- **Content Security Policy (CSP)**: The application enforces a strict CSP in `next.config.ts`, allowing connections only to the configured Supabase project.
- **Environment Variables**: API keys are handled via `NEXT_PUBLIC_` variables. The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public by design but is restricted by Row Level Security (RLS) policies on the Supabase backend (if database tables were used; currently only Realtime is used).

## Dependencies

We regularly run `npm audit` to ensure dependencies are free of known vulnerabilities.
