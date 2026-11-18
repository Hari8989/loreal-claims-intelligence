# L'Oréal Claims Intelligence Engine

An internal application that evaluates product claims against scientific evidence
submitted by the user. It returns a structured, evidence-limited AI assessment and
persists each assessment for human scientific and regulatory review. The AI does not
approve or authorize claims.

## Technology stack

- Frontend: React 19, TypeScript, Vite, Axios
- Backend: NestJS 12, TypeScript, Node.js ESM
- Database: PostgreSQL 17
- ORM: Prisma 7 with the generated client and PostgreSQL driver adapter
- AI: Official OpenAI Node.js SDK and Responses API with JSON Schema structured output
- Runtime: Node.js 24

## Architecture

- `frontend/` contains the responsive claims assessment interface. It calls
  `POST /api/claims/assess` and renders the API's assessment response.
- `backend/src/claims/` contains the request DTO, controller, assessment orchestration,
  and OpenAI assessment engine.
- `backend/src/prisma/` provides the reusable Prisma service and module.
- `backend/prisma/schema.prisma` defines `Claim` and `Assessment`. Each claim can retain
  multiple assessments and evidence submissions.
- `backend/prisma/migrations/` contains the PostgreSQL migration history.
- `docs/` is reserved for project documentation; the setup and design overview are in
  this README and the frontend/backend READMEs.

## Features

- Submit a product name, category, claim, and scientific evidence.
- Get a structured decision, confidence score, reasoning, and evidence limitations.
- Store claims and assessment history in PostgreSQL, including model and prompt
  metadata.
- Flag every AI assessment for human scientific and regulatory review.
- Validate requests and provide clear loading, validation, and service error states.

## Requirements

- Node.js 24 and npm
- PostgreSQL 17
- OpenAI API key and model name to run assessments

## Environment variables

Copy `backend/.env.example` to `backend/.env` only when the local file does not already
exist. Set these values in the backend environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI credential; keep it in the backend environment |
| `OPENAI_MODEL` | OpenAI model identifier (example: `gpt-4.1-mini`) |
| `PORT` | Optional API port; defaults to `3000` |
| `OBSERVE_APP_KEY` | Optional NestJS Observe key, required when telemetry is enabled |
| `OBSERVE_APP_SECRET` | Optional NestJS Observe secret, required when telemetry is enabled |
| `NODE_ENV` | Set to `production` to enable NestJS Observe telemetry |

The frontend uses only public client configuration. Its optional
`VITE_API_BASE_URL` variable defaults to `http://localhost:3000`; copy
`frontend/.env.example` to `frontend/.env` only if you need to override that URL. Never
put backend credentials in a `VITE_` variable.

## Local setup

### 1. Install dependencies

```bash
cd backend
npm install
```

In a second terminal:

```bash
cd frontend
npm install
```

### 2. Configure the backend

If `backend/.env` does not exist, create it from the safe example:

```bash
cd backend
cp .env.example .env
```

Set `DATABASE_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL` in `backend/.env`. Do not
replace an existing `.env` file when setting up the project.

### 3. Apply migrations and generate Prisma Client

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

For production deployments, apply committed migrations with:

```bash
npx prisma migrate deploy
```

### 4. Start the backend and frontend

In one terminal:

```bash
cd backend
npm run start:dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Open `http://127.0.0.1:5173`. Nest CORS allows the local Vite origins
`http://localhost:5173` and `http://127.0.0.1:5173`. The assessment endpoint is
`POST http://localhost:3000/api/claims/assess`.

## Build and test

Frontend production build:

```bash
cd frontend
npm run build
```

Backend production build and unit tests:

```bash
cd backend
npm run build
npm test
```

Backend end-to-end tests use the configured PostgreSQL database:

```bash
cd backend
npm run test:e2e
```

The frontend currently has no automated test script.

## AI and scientific safeguards

- The model evaluates only the evidence submitted with the claim. Evidence text is
  treated as untrusted input, not as system instructions.
- The model must not invent study results, measurements, sample sizes, or conclusions.
- Insufficient or ambiguous evidence is reported as `INCONCLUSIVE`; limitations are
  returned with the assessment.
- The API maps model decisions to the existing Prisma values: `JUSTIFIED` to
  `SUPPORTED`, `NOT_JUSTIFIED` to `NOT_SUPPORTED`, and `INCONCLUSIVE` to
  `INCONCLUSIVE`.
- The confidence score is an AI assessment score, not a statistically calibrated
  probability or proof of scientific validity.
- Every result requires human scientific and regulatory review and cannot authorize a
  product claim.
- Missing OpenAI configuration returns HTTP 503. NestJS Observe telemetry is disabled
  outside production and can be enabled by setting `NODE_ENV=production`.
