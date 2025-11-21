# KeyPaw (frontend)

KeyPaw (public name) — a browser-based lock-picking puzzle game (repo: Keymaster). This repository contains a Vite + React frontend (`FEKeyMaster`) and a Node/Express backend (`BEKeyMaster`).

This README documents how to run the frontend, how it talks to the backend API, environment variables required for local development and production, and links to useful backend instructions.

If you landed here as a hiring manager or reviewer: the project demonstrates component architecture, responsive interactive UI, image-driven layout math, audio playback, authentication with JWT, and a small API-backed persistence layer for puzzles and completions.

—

## Quick links

- Frontend folder: `FEKeyMaster`
- Backend folder: `BEKeyMaster`
- Live demo: (if deployed, insert demo URL here)
- License: MIT (see `BEKeyMaster/LICENSE`)

## Features

- Interactive puzzles: Pin Tumbler and Dial Lock implementations
- Responsive, pixel-aligned layout that reads image natural sizes to compute coordinates
- Auth (signup/login) using JWT, persisted in PostgreSQL
- Puzzle persistence and completion tracking (Postgres)
- Deployed-ready: Vite build for Netlify, Express API for Railway/Supabase or similar

## Tech stack

- Frontend: React, Vite, plain CSS
- Backend: Node.js, Express, pg (node-postgres)
- Database: PostgreSQL
- Auth: bcrypt + jsonwebtoken (JWT)

## Getting started (development)

Prerequisites

- Node.js 18+ and npm
- PostgreSQL (local) or a remote database (Railway, Supabase)
- Optional: psql CLI for running quick queries

Steps

1. Clone the repo and change into the project root:

```bash
git clone <repo-url>
cd KeyMaster
```

2. Backend setup (run in `BEKeyMaster`)

- Create a `.env` in `BEKeyMaster` containing at minimum:

```ini
PORT=3001
DATABASE_URL=postgres://user:pass@host:5432/dbname
JWT_SECRET=your-jwt-secret
CLIENT_ORIGIN=http://localhost:5173   # or your frontend origin
```

- Install and run the backend:

```bash
cd BEKeyMaster
npm ci
# Start in dev (nodemon/watch) or production
npm run dev   # if script exists, otherwise: NODE_ENV=development node server.js
```

- If you're using a fresh DB, seed demo puzzles (careful: seed script may DELETE existing puzzles):

```bash
node db/seed.js
```

3. Frontend setup (run in `FEKeyMaster`)

- Create a `.env` in `FEKeyMaster` with the API base URL for development or production:

```ini
VITE_API_URL=http://localhost:3001
```

- Install and run the frontend:

```bash
cd FEKeyMaster
npm ci
npm run dev
```

Open the site at the Vite dev server URL (usually http://localhost:5173). The frontend will use `VITE_API_URL` as the API base; if that variable is not present it falls back to `http://localhost:3001`.

## Persisting / Editing puzzle prompts

- You can update prompts directly in the database via SQL (psql, Supabase SQL editor, or Railway SQL). Recommended: use `UPDATE puzzles SET prompt = '...' WHERE id = <id>;` to change a prompt without reseeding.
- Alternatively, the backend exposes puzzle management routes (see `BEKeyMaster/routes/puzzles.js`) that accept POST for creating puzzles and can be extended with PATCH for edits.

## Deployment notes

- Frontend: Netlify or any static host. The repository includes `FEKeyMaster/netlify.toml` with an example production `VITE_API_URL`.
- Backend: Host on Railway, Render, or similar. Ensure `CLIENT_ORIGIN` is set to your frontend origin and `DATABASE_URL` points to the production Postgres.
- DB SSL: the backend conditionally enables ssl for remote DBs — when using a local DB, ensure `DATABASE_URL` contains `localhost` so SSL isn't forced.

## Troubleshooting

- CORS / Preflight 404: ensure the backend sets Access-Control-Allow-Origin to the exact origin of the frontend (including https://) and that the backend responds to OPTIONS preflight with 204 and the required headers.
- ENETUNREACH / IPv6: some cloud containers lack IPv6 egress. If you see ENETUNREACH to a DB IPv6 address, ensure your DB provides an IPv4 address or update the backend to resolve and prefer IPv4.
- Missing JWT_SECRET: if login/signup fail with 500, set `JWT_SECRET` in backend env.

## Project structure

Top-level contains `FEKeyMaster/` (frontend) and `BEKeyMaster/` (backend). Key backend files:

- `BEKeyMaster/app.js` — Express app and CORS handling
- `BEKeyMaster/server.js` — server launcher
- `BEKeyMaster/db/index.js` — postgres pool wrapper
- `BEKeyMaster/routes/*` — auth and puzzles routes
- `BEKeyMaster/db/seed.js` — demo data insertion (careful: deletes puzzles on run)

Frontend highlights under `FEKeyMaster/src`:

- `src/lib/api.js` — central API helper using `import.meta.env.VITE_API_URL`
- `src/context/*` — Auth and Puzzle contexts
- `src/components/*` — puzzle components (PinTumbler, DialLock) and UI
- `src/pages/*` — app pages (Home, Play, GameBoard, Login/Signup)

## Contributing

- If you plan to contribute, create a branch, open a clear PR with the changes, and include screenshots or short GIFs for visual changes.
- For backend changes that affect schema, include migration notes or update `schema.sql`.

## License

This project is licensed under the MIT License. See `BEKeyMaster/LICENSE` for details.

## Contact

If you want help with setup, deployment, or edits, open an issue or reach out via the repo's contact info.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
