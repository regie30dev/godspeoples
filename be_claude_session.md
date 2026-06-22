# be-god-peoples — Claude Session Log

This file is the **historical reference and source context** for the project.
Every task, addition, and change made on the user's instruction is recorded here
so the codebase evolves coherently, uniformly, and with integrity.

> **Maintenance rule:** Update this log on every addition or change to the
> codebase. Newest entries go at the top of the "Change Log" section. Keep the
> "Current Architecture" and "Conventions" sections in sync with reality.

---

## Project Overview

- **Name:** `be-god-peoples`
- **Type:** Backend service (REST API)
- **Stack:** Node.js (ESM) + Express
- **Pattern:** MVC
- **Started:** 2026-06-22

---

## Current Architecture

```
be-god-peoples/
├── package.json            # Scripts, deps, ESM ("type": "module")
├── nodemon.json            # Dev runner config (watch src/)
├── .env.example            # Documented environment variables
├── .gitignore
├── .prettierrc             # Prettier formatting rules
├── .prettierignore         # Paths excluded from formatting
├── README.md               # Setup + usage docs
├── be_claude_session.md    # This session log
└── src/
    ├── server.js           # Bootstrap: DB connect, listen, graceful shutdown
    ├── app.js              # Express assembly (importable for tests)
    ├── config/
    │   ├── env.js          # Single frozen source for env vars
    │   └── database.js     # Sequelize instance + connectDatabase()
    ├── models/
    │   ├── index.js        # Model registry + syncModels()
    │   └── image.model.js  # Image model (Postgres BYTEA storage)
    ├── services/
    │   └── image.service.js # Image data-access layer
    ├── controllers/
    │   ├── health.controller.js   # Temporary test route handler
    │   └── image.controller.js    # Upload / list / fetch / serve / delete
    ├── routes/
    │   ├── index.js        # Aggregates feature routes under API prefix
    │   ├── health.routes.js
    │   └── image.routes.js
    ├── middlewares/
    │   ├── upload.js       # Multer (memory storage, JPG/PNG, size limit)
    │   ├── notFound.js     # 404 → error pipeline
    │   └── errorHandler.js # Centralized JSON errors (+ Multer/Sequelize mapping)
    └── utils/
        ├── ApiError.js     # Operational error with HTTP status
        ├── asyncHandler.js # Forwards async rejections to Express
        └── logger.js       # Lightweight, swappable logger
```

### Key endpoints

| Method | Path                     | Purpose                     |
| ------ | ------------------------ | --------------------------- |
| GET    | `/api/v1/health`         | Temporary health/test route |
| POST   | `/api/v1/images`         | Upload an image (JPG/PNG)   |
| GET    | `/api/v1/images`         | List image metadata         |
| GET    | `/api/v1/images/:id`     | Get one image's metadata    |
| GET    | `/api/v1/images/:id/raw` | Stream raw image bytes      |
| DELETE | `/api/v1/images/:id`     | Delete an image             |

### Data models

- **Image** (`images` table): `id` (UUID PK), `name`, `description`, `image`
  (BYTEA — the binary), `mimeType`, `size`, `date`, `createdAt`, `updatedAt`.

---

## Conventions (must be followed by all future work)

- **Module system:** ESM (`import`/`export`), `.js` extensions in imports.
- **Layering:** routes → controllers → (services → models). No business logic in routes.
- **Config:** never read `process.env` directly outside `src/config/env.js`.
- **Errors:** throw `ApiError(status, message)`; wrap async handlers with `asyncHandler`.
- **Response envelope:**
  - Success → `{ "success": true, "data": ... }`
  - Failure → `{ "success": false, "error": { "message", ...stack(dev only) } }`
- **API versioning:** all routes mounted under `API_PREFIX` (default `/api/v1`).
- **App vs. server:** keep `app.js` (assembly) separate from `server.js` (bootstrap)
  so the app stays importable for tests.
- **Logging:** use `utils/logger.js`, not raw `console.*`.
- **Formatting:** code is formatted with Prettier (`.prettierrc`); run
  `npm run format` before committing, `npm run format:check` in CI.
- **ORM:** Sequelize is the chosen ORM (Postgres dialect). Define models under
  `src/models/`, register them in `src/models/index.js`. Never instantiate a
  second Sequelize connection — import the shared one from `config/database.js`.
- **DB credentials:** live only in `.env` (read via `config/env.js`); never
  hard-code them. The server fails fast on a failed DB connection. `DATABASE_URL`
  (a full connection string) takes precedence over the discrete `DB_*` vars.
- **Env loading:** `.env` is loaded by Node's built-in `--env-file-if-exists=.env`
  flag (wired into the `start` script and `nodemon.json`); no `dotenv` dependency.
- **DB access:** controllers go through a service in `src/services/`; only
  services touch models directly.

---

## Change Log

### 2026-06-22 — Increased max upload size to 100 MB

- Raised `MAX_FILE_SIZE_MB` from 5 to 100 in `.env` and `.env.example`, and the
  code fallback default in `config/env.js` (5 → 100). Configurable per environment.
- Precedence: the `.env` value overrides the code fallback; all three kept aligned.
- Requires a server restart to take effect (env is read at boot).

### 2026-06-22 — Wire up .env loading + DATABASE_URL support

- Added support for a single `DATABASE_URL` connection string (`config/env.js`
  exposes `db.url`; `config/database.js` uses it when present, else falls back to
  the discrete `DB_*` settings).
- Enabled `.env` loading via Node's built-in `--env-file-if-exists=.env` in the
  `start` script and `nodemon.json` (no `dotenv` dependency added).
- Updated the user's `.env` and `.env.example` to document `DATABASE_URL`
  (password special chars must be URL-encoded: `&`→`%26`, `*`→`%2A`).
- **Verified end-to-end against the real local Postgres** (port 5432, `postgres`
  db): connection established, schema synced, `POST /images` persisted a PNG,
  `GET /images` listed it, `GET /images/:id/raw` returned correct
  `Content-Type`/`Content-Length` + bytes, and a non-image was rejected with 400.
  Test rows were cleaned up afterward (table left empty).

### 2026-06-22 — Image upload feature + Postgres/Sequelize integration

- **ORM decision:** chose **Sequelize** + `pg`/`pg-hstore` (best MVC fit for
  pure-ESM JS; file-based models under `src/models/`). Installed `multer` for
  multipart uploads.
- **DB connection** (`config/database.js`): single shared Sequelize instance,
  connection pool, SQL logging routed through our logger (dev only), explicit
  `connectDatabase()` with error handling. Credentials sourced only from `.env`.
- **Model** (`models/image.model.js`): `Image` with fields `name`, `description`,
  `image` (BYTEA binary), `mimeType`, `size`, `date` + timestamps. Stores the
  picture bytes directly in Postgres per requirement. `toMetadata()` helper
  strips the binary from JSON responses. Registered in `models/index.js` with a
  `syncModels()` helper.
- **Upload middleware** (`middlewares/upload.js`): Multer in-memory storage,
  filters to JPG/PNG, enforces `MAX_FILE_SIZE_MB` limit.
- **Service** (`services/image.service.js`): create / list (no binary) / get /
  delete — the only layer touching the model.
- **Controller** (`controllers/image.controller.js`): validates input, delegates
  to the service; upload / list / get / serve-raw / delete.
- **Routes** (`routes/image.routes.js`): mounted at `/api/v1/images`.
- **Error handling:** `errorHandler` now maps `MulterError` and Sequelize
  validation/constraint errors to clean 400 responses.
- **Bootstrap** (`server.js`): connects to the DB (optional `DB_SYNC` schema
  sync) before listening; fails fast on connection error; closes the DB pool on
  graceful shutdown.
- **Config/env:** added `db.*` and `upload.*` blocks; documented all new vars in
  `.env.example` (`DB_HOST/PORT/NAME/USER/PASSWORD`, `DB_SYNC`, `MAX_FILE_SIZE_MB`).
- **Verified:** app module builds with all routes wired; server fails fast with a
  clear log + exit code 1 on bad DB credentials. Full upload round-trip not run
  here (local Postgres on :5433 requires the user's credentials).
- **Note:** `npm audit` reports a moderate advisory in `uuid` (transitive via
  Sequelize); the only fix downgrades Sequelize to v3 (breaking) and the advisory
  doesn't apply to Sequelize's usage — left as-is intentionally.

### 2026-06-22 — Default server port changed to 4000

- Changed default `PORT` from 3000 to 4000 in `src/config/env.js` (env var still
  overrides). Updated `.env.example` and README references accordingly.
- Verified: server boots on `http://localhost:4000`, health route returns 200.

### 2026-06-22 — Prettier code formatting added

- Installed `prettier` as an exact dev dependency (`--save-exact`).
- Added `.prettierrc` (single quotes, semicolons, 2-space indent, trailing
  commas, 100 print width, LF line endings) and `.prettierignore`.
- Added npm scripts: `format` (write) and `format:check` (verify, for CI).
- Ran `npm run format` across the codebase to establish a consistent baseline.

### 2026-06-22 — Session log introduced

- Created `be_claude_session.md` (this file) to track all tasks, additions, and
  changes as the canonical project history and context reference.

### 2026-06-22 — Initial backend scaffold (Express + MVC)

- Initialized project: `package.json` (ESM, `start`/`dev`/`lint`/`test` scripts),
  `nodemon.json`, `.gitignore`, `.env.example`, `README.md`.
- Installed dependencies: `express` (runtime), `nodemon` (dev).
- Built MVC skeleton under `src/`:
  - `server.js` — HTTP bootstrap with graceful shutdown (SIGINT/SIGTERM) and
    `unhandledRejection`/`uncaughtException` guards.
  - `app.js` — Express app factory; JSON/urlencoded parsing; mounts routes;
    registers 404 + error handlers last.
  - `config/env.js` — frozen, validated environment config.
  - `controllers/health.controller.js` — temporary test route handler.
  - `routes/index.js` + `routes/health.routes.js` — versioned route aggregation.
  - `middlewares/notFound.js`, `middlewares/errorHandler.js` — uniform error flow.
  - `utils/ApiError.js`, `utils/asyncHandler.js`, `utils/logger.js`.
- **Verified runnable:** server boots, `GET /api/v1/health` → 200 JSON,
  unknown route → structured 404, graceful shutdown confirmed.
- **Open item:** `.env` is not auto-loaded yet; config relies on defaults +
  process env. (Pending user decision: Node `--env-file` vs `dotenv`.)
