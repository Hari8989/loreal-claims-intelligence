# Claims Intelligence Engine frontend

React 19 and TypeScript application built with Vite. The frontend calls the NestJS
assessment endpoint at `POST /api/claims/assess`.

## Run locally

```bash
npm install
npm run dev
```

The default API base URL is `http://localhost:3000`. To override it, copy
`.env.example` to `.env` and set `VITE_API_BASE_URL`. Only public client configuration
belongs in `VITE_` variables; backend credentials must remain in the backend
environment.

The Vite server uses `http://127.0.0.1:5173`, which is included in the backend's
development CORS allowlist.
