# Deployment guide

## Status and requirements

This repository is prepared for deployment, but **has not been deployed**.
Vercel is the recommended host because the application uses the Next.js App
Router and no custom server or native runtime dependency.

- Node.js 22.x (the installed Next.js release requires Node.js 20.9 or newer)
- npm and the committed `package-lock.json`
- A Vercel account and repository connection only if the owner elects to
  publish; neither is created or configured by this project

No environment variables, API keys, database, external AI service, blockchain,
carrier, or sensor credentials are required for the synthetic demo.

## Reproducible local setup

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

The production server listens on port 3000 by default. Set `PORT` when a
different local port is needed:

```bash
PORT=3100 npm run start
```

The browser suite uses the production build and starts it on port 3210:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

CI installs Chromium and its Linux dependencies with
`npx playwright install --with-deps chromium`.

## Vercel deployment (owner action required)

1. Review the current Git diff and ensure the owner has approved committing
   and pushing the desired changes. This work does not commit or publish.
2. In Vercel, import the repository only after the owner has authorized the
   GitHub/Vercel connection.
3. Keep the framework preset on **Next.js**. Use `npm ci` for installation
   and `npm run build` for the build command; the standard Next.js output
   directory is `.next`.
4. Select Node.js 22.x in the project build settings.
5. Leave environment variables empty for this demonstration. Do not add
   credentials or production integrations.
6. Deploy only after confirming the deployed URL contains synthetic,
   public-safe data. Review every route, the unknown-batch 404, and mobile
   behavior on the actual deployment.

No `vercel.json` is necessary for the current app. Do not describe the project
as deployed until Vercel reports a successful deployment and the deployed
routes have been checked.

## Rollback and data considerations

Deployments contain deterministic fixtures and static application code.
Inventory edits, anomaly workflow status, and traceability event examples are
stored in each visitor's browser localStorage, not in Vercel or a shared
database. Clearing local browser data resets those demo workflows. There is no
server-side operational write path to roll back.

## Troubleshooting

- **Node version/build error:** use Node 22.x and rerun `npm ci`.
- **Missing Playwright browser:** run `npx playwright install chromium` locally.
- **Port 3210 is already in use:** stop the process only if it is known to be
  the local test server, or change the port and `baseURL` together in
  `playwright.config.ts`.
- **No deployment credentials:** do not add credentials to source or `.env`
  files; an authorized owner must complete the Vercel account connection.
