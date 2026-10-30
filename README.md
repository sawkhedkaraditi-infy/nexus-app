# Nexus : Full-Stack Operations & Customer Services Platform
(Dummy Data)
A portfolio project: animated landing page, role-based authentication, Project Tracker, Live Operations dashboard and Loan Centre, plus small Realty and Assistant add-ons. Every row in the database is **dummy data** created by `prisma/seed.ts`.

> Independent concept project. Not affiliated with any company. No real logos, names or data.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Prisma 6 · MySQL · jose (JWT in httpOnly cookies) · bcryptjs · Zod · Framer Motion

## 1. Run it locally in VS Code

Requirements: Node.js 20+, and either Docker or any MySQL 8 server.

```bash
# 1. install dependencies
npm install

# 2. create your env file
cp .env.example .env          # on Windows: copy .env.example .env
#    then set AUTH_SECRET to a long random string

# 3. start a local MySQL (skip if you already have one)
docker compose up -d

# 4. create the tables and load the dummy data
npm run db:push
npm run db:seed

# 5. start the app
npm run dev                   # http://localhost:3000
```

Use `npm run db:reset` any time to wipe and re-seed the database.

### Demo accounts (dummy)

| Role | Email | Password | Can see |
|---|---|---|---|
| Admin | admin@nexus.demo | Admin@123 | everything |
| Manager | manager@nexus.demo | Manager@123 | everything |
| Customer | customer@nexus.demo | Customer@123 | Loans, Realty, Assistant |

New sign-ups are always created as Customer.

## 2. Deploy to Vercel

Vercel and Netlify run serverless functions, so this app uses polling (not WebSockets) for the live dashboard, and a hosted MySQL database.

1. **Create a free hosted MySQL.** Options: TiDB Cloud Serverless, Aiven, Railway, PlanetScale. Copy the connection string (`mysql://user:pass@host:port/db`). Some providers need `?sslaccept=strict` appended.
2. **Create the tables and seed the hosted DB from your laptop** (one time):
   ```bash
   # put the hosted URL in .env as DATABASE_URL, then:
   npm run db:push
   npm run db:seed
   ```
3. **Push the project to GitHub.**
4. **Import the repo in Vercel** and add two environment variables:
   - `DATABASE_URL` = your hosted MySQL URL
   - `AUTH_SECRET` = output of `openssl rand -base64 32`
5. Deploy. The build command already runs `prisma generate`.

Netlify works the same way (Next.js is supported natively); set the same two variables.

## 3. Project structure

```
prisma/
  schema.prisma          database models
  seed.ts                dummy data
src/
  middleware.ts          protects /dashboard, keeps customers out of manager pages
  lib/                   db client, JWT/session, role guard, loan maths, live simulation
  app/
    page.tsx             animated landing page
    login/ register/     authentication pages
    dashboard/           overview, tracker, live, loans, realty, assistant
    api/                 REST route handlers (auth, projects, loans, live, realty, assistant)
  components/            charts, SVG illustrations, animated skyline, nav, forms
```

## 4. Major Part

- **Auth:** bcrypt password hashing, signed JWT stored in an httpOnly, sameSite cookie (not readable by JavaScript), middleware redirects, and role checks again inside every API route.
- **Validation:** Zod schemas on every endpoint; the same loan maths runs in the browser (preview) and on the server (decision).
- **Live dashboard:** serverless hosting cannot hold WebSocket connections, so the API returns a deterministic time-based simulation and the browser polls every 2 seconds. Moving to WebSockets or Server-Sent Events on a long-running server is a natural next step.
- **Database design:** relational models with foreign keys and indexes; milestones drive project progress and automatic status (At Risk, Delayed, Completed).
- **Assistant:** TF-IDF style keyword retrieval over documents stored in the database. Replacing it with embeddings and an LLM is the obvious upgrade (a Python/FastAPI service would fit here).
- **Honest limits:** dummy data, simulated telemetry, no payment or real credit checks, no automated tests yet.

## 5. Ideas to extend

- Add Vitest + Playwright tests and a GitHub Actions workflow
- Admin page to change user roles
- Replace generated SVG art with licensed photos using `next/image`
- GraphQL endpoint for the analytics views
- Embeddings + LLM for the Assistant
