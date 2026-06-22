# be-god-peoples

Backend service built with **Node.js + Express** following the **MVC pattern**.

## Requirements

- Node.js >= 18
- PostgreSQL >= 13

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file and fill in your DB credentials
cp .env.example .env

# 3. Create the database (one-time)
createdb be_god_peoples   # or: CREATE DATABASE be_god_peoples;

# 4. Run in development (auto-reload via nodemon)
#    Set DB_SYNC=true in .env on first run to auto-create the tables.
npm run dev

# Or run in production mode
npm start
```

> The server connects to Postgres on boot and **fails fast** (exits non-zero)
> if the database is unreachable. All DB credentials are read from `.env`.

## Verify it runs

Once started, hit the temporary health route:

```bash
curl http://localhost:4000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "data": { "status": "ok", "service": "be-god-peoples", "uptime": 0.12, "timestamp": "..." }
}
```

## API

Base path: `/api/v1`

| Method | Path              | Description                             |
| ------ | ----------------- | --------------------------------------- |
| GET    | `/health`         | Health/test route                       |
| POST   | `/images`         | Upload an image (`multipart/form-data`) |
| GET    | `/images`         | List image metadata (no binary)         |
| GET    | `/images/:id`     | Get a single image's metadata           |
| GET    | `/images/:id/raw` | Stream the raw image bytes              |
| DELETE | `/images/:id`     | Delete an image                         |

### Upload an image

Accepts **JPG** and **PNG** only (max size from `MAX_FILE_SIZE_MB`, default 5 MB).
Send `multipart/form-data` with file field `image` and a required `name` field:

```bash
curl -X POST http://localhost:4000/api/v1/images \
  -F "image=@/path/to/photo.jpg" \
  -F "name=My Photo" \
  -F "description=A test upload"
```

## Project structure

```
src/
├── app.js                 # Express app assembly (middleware + routes)
├── server.js              # Bootstrap: DB connect, HTTP server, graceful shutdown
├── config/
│   ├── env.js             # Centralized, frozen environment config
│   └── database.js        # Sequelize instance + connection handling
├── models/                # Data models (the "M" in MVC)
│   ├── index.js           # Model registry + sync helper
│   └── image.model.js     # Image (picture) model — Postgres BYTEA storage
├── services/              # Data-access / business logic
│   └── image.service.js
├── controllers/           # Request handlers (the "C" in MVC)
│   ├── health.controller.js
│   └── image.controller.js
├── routes/                # Route definitions, mapped to controllers
│   ├── index.js           # Aggregates all feature routes
│   ├── health.routes.js
│   └── image.routes.js
├── middlewares/
│   ├── upload.js          # Multer upload (JPG/PNG, size limit)
│   ├── notFound.js        # 404 handler
│   └── errorHandler.js    # Centralized error responses
└── utils/
    ├── ApiError.js        # Operational error with HTTP status
    ├── asyncHandler.js    # Async route error forwarding
    └── logger.js          # Lightweight logger
```

## Scripts

| Script        | Description                     |
| ------------- | ------------------------------- |
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start`   | Start in production             |
| `npm test`    | Placeholder (no tests yet)      |
