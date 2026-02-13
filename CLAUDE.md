# CLAUDE.md — iSettle

## Project Overview

**iSettle** is a web application that helps offline poker players calculate final payoffs at the end of a game session. An admin enters each player's buy-in count and their final chip/cash amount, and iSettle computes the minimum number of payments needed to settle all debts.

### Key Concepts

- **Buy-in**: A fixed amount each player pays to enter or re-enter the game (e.g., ₹500).
- **Total paid in**: `buy_in_amount × number_of_buy_ins` for a given player.
- **Cash in hand**: The amount a player holds at the end of the game.
- **Net**: `cash_in_hand - total_paid_in`. Positive = winner, negative = loser.
- **Settlement**: The minimum set of transactions so all losers pay winners and everyone nets out to zero.

### Constraints

- 2–8 players per game.
- Single admin operates the app (no multi-user auth).
- Single-session calculator — no persistent storage or database.
- Currency: Indian Rupees (₹ / INR).

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Language    | TypeScript (strict mode)          |
| Frontend    | React 18+ (Vite)                  |
| Styling     | Tailwind CSS                      |
| Backend     | Node.js + Express                 |
| Testing     | Vitest (unit), React Testing Library (component) |
| Linting     | ESLint with TypeScript rules      |
| Formatting  | Prettier                          |
| Package Mgr | npm                               |

---

## Project Structure (Planned)

```
iSettle/
├── CLAUDE.md                # This file — project guide for AI assistants
├── package.json             # Root workspace config
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Frontend utility functions
│   │   ├── types/           # Shared TypeScript types/interfaces
│   │   ├── App.tsx          # Root app component
│   │   └── main.tsx         # Vite entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML entry point
│   ├── tailwind.config.ts   # Tailwind configuration
│   ├── tsconfig.json        # Frontend TS config
│   ├── vite.config.ts       # Vite configuration
│   └── package.json
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic (settlement algorithm)
│   │   ├── types/           # Backend TypeScript types
│   │   └── index.ts         # Server entry point
│   ├── tsconfig.json        # Backend TS config
│   └── package.json
└── shared/                  # Shared types between client and server
    └── types.ts
```

---

## Core Data Model

```typescript
interface Player {
  name: string;           // Unique player name
  buyInCount: number;     // Number of buy-ins taken (≥ 1)
  cashInHand: number;     // Amount held at end of game (≥ 0)
}

interface GameSession {
  buyInAmount: number;    // Fixed buy-in amount for this game (e.g., 500)
  players: Player[];      // 2–8 players
}

interface Settlement {
  from: string;           // Player who pays
  to: string;             // Player who receives
  amount: number;         // Amount in ₹
}
```

---

## Settlement Algorithm

The app uses a **minimum-transaction greedy algorithm**:

1. Compute each player's net: `net = cashInHand - (buyInAmount × buyInCount)`.
2. Separate players into **debtors** (net < 0) and **creditors** (net > 0).
3. Sort debtors by amount owed (descending) and creditors by amount owed (descending).
4. Match the largest debtor with the largest creditor:
   - Transfer `min(|debtor.net|, creditor.net)`.
   - Reduce both balances accordingly.
   - Remove any player whose balance reaches zero.
5. Repeat until all balances are settled.

**Invariant**: The sum of all nets must equal zero (money in = money out). Validate this before computing settlements.

---

## Development Workflow

### Setup

```bash
npm install          # Install all dependencies (root + workspaces)
```

### Running Locally

```bash
npm run dev          # Starts both client (Vite) and server (Express) concurrently
npm run dev:client   # Frontend only (Vite dev server, default port 5173)
npm run dev:server   # Backend only (Express, default port 3001)
```

### Building

```bash
npm run build        # Build both client and server for production
```

### Testing

```bash
npm test             # Run all tests
npm run test:client  # Frontend tests only
npm run test:server  # Backend tests only
```

### Linting & Formatting

```bash
npm run lint         # Run ESLint across the project
npm run format       # Run Prettier across the project
```

---

## API Endpoints

### `POST /api/settle`

Computes the settlement for a game session.

**Request body:**
```json
{
  "buyInAmount": 500,
  "players": [
    { "name": "Alice", "buyInCount": 2, "cashInHand": 1500 },
    { "name": "Bob", "buyInCount": 1, "cashInHand": 200 },
    { "name": "Charlie", "buyInCount": 1, "cashInHand": 300 }
  ]
}
```

**Response:**
```json
{
  "settlements": [
    { "from": "Bob", "to": "Alice", "amount": 300 },
    { "from": "Charlie", "to": "Alice", "amount": 200 }
  ],
  "summary": [
    { "name": "Alice", "totalIn": 1000, "cashInHand": 1500, "net": 500 },
    { "name": "Bob", "totalIn": 500, "cashInHand": 200, "net": -300 },
    { "name": "Charlie", "totalIn": 500, "cashInHand": 300, "net": -200 }
  ]
}
```

**Validation rules:**
- `buyInAmount` must be a positive number.
- `players` array must have 2–8 entries.
- Each player must have a non-empty `name`, `buyInCount ≥ 1`, and `cashInHand ≥ 0`.
- Sum of all nets must equal zero (total money in = total money out).

---

## Code Conventions

### General

- **TypeScript strict mode** — no `any` types unless absolutely unavoidable.
- Prefer `const` over `let`; never use `var`.
- Use **named exports** (not default exports).
- Use **arrow functions** for callbacks; regular `function` for top-level declarations.
- File names: `kebab-case.ts` for utilities, `PascalCase.tsx` for React components.

### React

- Functional components only (no class components).
- Use React hooks for state and side effects.
- Keep components small and focused — extract logic into custom hooks.
- Props interfaces named `{ComponentName}Props`.
- Co-locate component-specific types in the same file.

### Backend

- Express route handlers should be thin — delegate logic to service functions.
- Validate all incoming request data at the route level before passing to services.
- Return appropriate HTTP status codes (200, 400, 422, 500).

### Testing

- Test files live next to the source files: `foo.ts` → `foo.test.ts`.
- Focus tests on behavior, not implementation details.
- For the settlement algorithm, test edge cases: 2 players, 8 players, all even, single winner, single loser.

### Git

- Commit messages: imperative mood, concise (e.g., "Add settlement algorithm", "Fix player validation").
- One logical change per commit.
- Branch naming: `feature/description` or `fix/description`.

---

## UI Flow

1. **Game Setup Screen**: Admin enters the fixed buy-in amount for the game.
2. **Player Entry Screen**: Admin adds players one by one (name + number of buy-ins + cash in hand). Can add 2–8 players.
3. **Review Screen**: Shows all entered data. Admin confirms or edits.
4. **Results Screen**: Displays the settlement list — "Player X pays ₹Y to Player Z" for each required transaction.
5. **Reset**: Option to start a new game session.

---

## Validation & Edge Cases

- Reject if fewer than 2 or more than 8 players.
- Reject if total money out ≠ total money in (display a clear error).
- Handle the case where everyone breaks even (no settlements needed).
- Player names must be unique (case-insensitive comparison).
- All monetary values should be rounded to whole rupees.

---

## Environment Variables

| Variable    | Default | Description                  |
|-------------|---------|------------------------------|
| `PORT`      | `3001`  | Express server port          |
| `NODE_ENV`  | `development` | Runtime environment   |
| `VITE_API_URL` | `http://localhost:3001` | API base URL for frontend |

---

## Notes for AI Assistants

- This is a **greenfield project** — the repo starts empty.
- Prioritize simplicity. No auth, no database, no complex state management (React context or props are sufficient).
- The settlement algorithm is the core business logic — it must be correct and well-tested.
- Keep the UI clean and functional. Responsive design using Tailwind's responsive utilities.
- All money calculations use integers (whole rupees) to avoid floating-point issues.
- When making changes, always ensure the total-money invariant holds: `Σ(cashInHand) = Σ(buyInAmount × buyInCount)`.

---

## Planned Future Features

### WhatsApp Share (v2)

- Share settlement results via WhatsApp using a `wa.me` deep link or the Web Share API.
- **Design for this now**: Keep settlement result rendering decoupled from display. The results component should produce a plain-text summary (e.g., "Player A pays ₹300 to Player B") that can be passed to a share function later without refactoring.
- The results data structure (`Settlement[]`) should be easily serializable to a human-readable string.
