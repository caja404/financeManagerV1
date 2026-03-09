# FinanceMonitor

FinanceMonitor is now set up as a full-stack MVP:
- Angular 21 frontend
- Express + Prisma + PostgreSQL backend in [backend-production/README.md](backend-production/README.md)
- JWT auth
- Persistent transaction storage
- Dashboard and reports from live data

## Local development

Frontend:

```bash
npm install
npm start
```

Backend:

```bash
cd backend-production
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Frontend runs on `http://localhost:4200`
Backend runs on `http://localhost:4000`

## Production deployment

The repo now includes a full production compose stack:
- [docker-compose.production.yml](docker-compose.production.yml)
- [Dockerfile](Dockerfile) for the frontend
- [deploy/nginx/default.conf](deploy/nginx/default.conf) for SPA serving and `/api` reverse proxy
- [backend-production/Dockerfile](backend-production/Dockerfile) for the API
- [.env.production.example](.env.production.example) for production secrets

### Deploy with Docker

1. Copy [.env.production.example](.env.production.example) to `.env.production`
2. Replace every placeholder secret
3. Run:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

4. Apply database migrations:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml exec api npm run prisma:migrate
```

5. Open your app on port configured by `FRONTEND_PORT`

## MVP status

Ready now:
- Auth
- Transactions CRUD
- Dashboard
- Reports
- Containerized deployment path

Still backlog:
- Budgets frontend
- Investments, notes, credit cards modules
- Password reset and email verification
- Automated tests for critical flows
- Monitoring/alerting and backups
- HTTPS/domain/reverse proxy at infrastructure edge

## Build validation

Frontend:

```bash
npm run build
```

Backend:

```bash
cd backend-production
npm run build
```
