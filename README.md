# Capacitor Lab

This repository contains an interactive 3D capacitor simulation built as a React + TanStack Start app. The main experience is a single-page laboratory scene where the user can charge a spherical capacitor, toggle visualization layers, and trigger a stylized discharge event.

The project sits inside the App Builder workspace scaffold, and it includes optional Better Auth / PostgreSQL support, but the shipped experience is the lab simulation itself rather than an auth-driven app.

## Overview

The app renders a grounded heavy-sphere capacitor setup in a browser using Three.js. The UI exposes:

- a charge button and charging controls
- a touch/discharge action that triggers the shock sequence
- cutaway, field-line, and label toggles
- live readouts for voltage, charge, energy, and capacitance
- keyboard shortcuts (`C`, `T`, `R`) for charging, touching, and resetting

The simulation logic lives in `src/lab`, while the app shell and router are handled by the TanStack Start structure under `src/routes` and `src/router.tsx`.

## Tech stack

- React 19
- TypeScript
- Vite 8
- TanStack Start / Router / Query
- Tailwind CSS v4
- Three.js + `@react-three/fiber` + `@react-three/drei` + postprocessing
- Zustand state management
- Better Auth (optional, feature-flagged)
- PostgreSQL via `pg` or embedded PGLite fallback
- ESLint, Prettier, Playwright-based QA scripts

## Repository structure

```text
.
├── public/
│   ├── __grok/
│   ├── favicon.svg
│   └── og.jpg
├── scripts/
│   ├── app-env-plugin.mjs
│   ├── browser-smoke.mjs
│   ├── check-auth-invariant.mjs
│   ├── grok-pwa-plugin.mjs
│   ├── migrate.mjs
│   ├── migration-plan.mjs
│   ├── preview.mjs
│   ├── with-app-env.mjs
│   └── ...
├── server/
│   └── middleware/
├── src/
│   ├── components/
│   ├── lab/
│   │   ├── ui/
│   │   ├── world/
│   │   ├── audio.ts
│   │   ├── physics.ts
│   │   ├── store.ts
│   │   └── CapacitorLab.tsx
│   ├── lib/
│   │   ├── app-data/
│   │   ├── auth/
│   │   ├── db.ts
│   │   ├── error-component.tsx
│   │   ├── preview-host-bridge.ts
│   │   └── utils.ts
│   ├── routes/
│   │   ├── __root.tsx
│   │   └── index.tsx
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   └── styles.css
├── migrations/
│   └── auth/
│       └── 0001_auth.sql
├── .grok/
├── .gitignore
├── .prettierrc
├── AGENTS.md
├── eslint.config.mjs
├── package.json
├── startup.sh
├── tsconfig.json
├── vite.config.ts
├── package-lock.json
└── README.md
```

## Setup and installation

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

This app serves on `0.0.0.0:8080` as configured in `vite.config.ts`, and the project also includes a startup script at `startup.sh` that checks port 8080 and launches the app if needed.

## Development commands

The project scripts are defined in `package.json`:

```bash
npm run dev              # start the Vite/TanStack dev server on :8080
npm run build            # build production assets and run migrations
npm run db:migrate       # apply SQL migrations from migrations/
npm run build:dev       # development build
npm run preview          # preview built app via Vite
npm run preview:restart  # restart the preview server
npm run preview:stop     # stop the preview server
npm run typecheck        # type-check the project with TypeScript
npm run check:auth       # auth invariant checks
npm run test             # run Node-based tests
npm run lint             # ESLint
npm run format           # Prettier write
```

## Environment configuration

The repository does not include a committed `.env` file. Runtime configuration is handled through environment variables when needed.

Relevant runtime settings in the codebase include:

- `DATABASE_URL` for a real PostgreSQL deployment. If it is absent, the app falls back to an embedded PGLite database.
- `VITE_AUTH_ENABLED` to control the auth feature flag. The auth layer is present in `src/lib/auth/server.ts`, but the app is not forced into auth mode by default.
- `BETTER_AUTH_SECRET` and related auth configuration when enabling Better Auth.
- OAuth broker values such as `GROK_AUTH_ISSUER`, `GROK_AUTH_CLIENT_ID`, and `GROK_AUTH_CLIENT_SECRET` for federated auth flows.

The app is designed to work with both a real Postgres deployment and the local fallback, so local preview/dev environments can run without a configured database.

## Database and migrations

The repository includes a migration system under `migrations/`.

- `migrations/*.sql` is the primary schema source for app data.
- `migrations/auth/0001_auth.sql` is the auth schema used when the Better Auth integration is enabled.
- `scripts/migrate.mjs` applies pending SQL files to the configured database.
- `src/lib/db.ts` automatically applies migrations in the PGLite fallback when no `DATABASE_URL` is present.

This means local or preview builds can boot with an embedded database without additional setup, while deploys can swap in a Neon/Postgres database by setting `DATABASE_URL`.

## Deployment notes

The app is configured for Vercel-oriented deployment:

- `vite.config.ts` registers Nitro with `preset: "vercel"` during build/preview.
- `npm run build` runs `vite build` and then `db:migrate`.
- the project includes PWA branding and middleware under `server/` and `public/__grok/`.
- the preview/QA script contract uses `startup.sh` and the `preview` utilities in `scripts/`.

The repo is not a multi-user web app; it is a local browser simulation and tooling scaffold.

## Usage guidance

Once the dev server is running, open the app in a browser at:

```text
http://localhost:8080
```

Use the interface to:

- hold the charge button to build up voltage
- press `Touch the ball` / `T` to discharge the capacitor
- toggle the cutaway, field lines, and labels for different views
- reset the experiment with the reset control or `R`

The simulation is intended for visual experimentation and educational demonstration; it does not implement user accounts or persistent game data by default.

## Notes

This repository is a code-and-simulation workspace rather than a traditional application backend. The current place where behavioral logic lives is `src/lab`, while the framework and optional auth/database plumbing are shared scaffolding for the broader App Builder environment.
