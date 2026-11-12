# Architecture

## Current application

- **Framework:** Next.js App Router with React Server Components by default.
- **Language:** TypeScript with strict checking.
- **Styling:** Tailwind CSS v4 and shadcn/ui components.
- **Charts:** Recharts, isolated in a small client component.
- **Validation and utilities:** Zod validates shared and browser-persisted
  structures; date-fns and QR rendering support forecast and traceability
  workflows. TanStack Table is installed but the current inventory workspace
  uses a native table.
- **Data:** Typed synthetic records live in `src/data/` and
  `src/lib/mock-data.ts`; UI components do not own the source records.
- **Workflow persistence:** Inventory adjustments, anomaly status/activity, and
  traceability event examples use schema-validated browser localStorage. There
  is no shared persistence or authentication.
- **Quality:** Node's built-in test runner covers data and business logic;
  Playwright exercises production-build browser workflows. GitHub Actions
  runs checks on pushes to `main` and pull requests.

## Structure

- `src/app/` owns route entry points and the root layout.
- `src/components/layout/` owns navigation and the shared application shell.
- `src/components/dashboard/` owns the modular overview widgets.
- `src/components/analytics/`, `monitoring/`, `intelligence/`,
  `forecasting/`, `inventory/`, and `traceability/` own focused workspaces.
- `src/components/ui/` contains CLI-generated shadcn/ui primitives.
- `src/types/`, `src/data/`, and `src/lib/` separate contracts, fixtures, and
  calculations.
- `e2e/` contains the repeatable Playwright demo workflows; `playwright.config.ts`
  runs them against the local production server.
- `docs/` contains architecture, evaluation, deployment, demo, and clearly
  labeled product-planning artifacts.

## Boundaries and future integrations

The current app is a local UI demonstration. There is no API, database,
authentication, external AI provider, IoT feed, or blockchain integration.
Future server-side integrations should keep credentials out of client
components, validate input at boundaries, and add explicit loading/error
handling. The deployed-ready configuration does not constitute a deployment;
no hosting account or public URL is configured. Blockchain dependencies are
intentionally deferred.
