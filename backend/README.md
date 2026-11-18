# Backend

NestJS 12 API for the L'Oréal Claims Intelligence Engine. See the [project README](../README.md)
for architecture, environment variables, local setup, and full-stack commands.

Backend commands:

```bash
npm run start:dev
npm run build
npm test
npm run test:e2e
```

The development server loads `backend/.env`. E2E tests require a reachable PostgreSQL
database configured by `DATABASE_URL`.
