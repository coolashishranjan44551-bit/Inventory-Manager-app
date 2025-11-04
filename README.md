# Inventory & Café Management SaaS Blueprint

## Architecture Overview
- **Client (Next.js PWA)**: Multi-tenant SPA served from Vercel with offline caching, background sync, and responsive UI for desktops, tablets, and mobiles. Tailwind CSS and shadcn/ui provide consistent theming and accessible components.
- **API Layer**: Next.js App Router route handlers deliver all business logic. Routes can run on the Edge for tenant detection and auth verification or the Node runtime for intensive tasks. Future swap to FastAPI microservices is viable for specific workloads.
- **Database & Auth**: Supabase (Postgres + Auth + Storage). Every table is partitioned by `org_id` and protected with row-level security policies. Supabase Auth handles OTP/magic link sign-in and issues JWTs enriched with `org_id` and `role` claims.
- **Realtime & Offline**: Supabase Realtime broadcasts inventory and POS changes. IndexedDB (via `idb`) caches data and queues mutations for offline usage; background sync flushes queued actions when connectivity returns.
- **Printing**: Browser print templates for 80 mm thermal receipts and A4 invoices. Optional PrintNode or WebUSB bridge for direct thermal printer integration.
- **Observability**: Supabase logs shipped to Slack; Vercel analytics and optional Sentry capture client-side errors.
- **CI/CD & Backups**: GitHub repository auto-deploys to Vercel. Supabase migrations managed through Prisma or Supabase CLI with nightly backups and optional point-in-time recovery.

## Tech Stack Setup
1. **Frontend**
   - Next.js 14 (TypeScript, App Router) with Tailwind CSS, shadcn/ui, and Radix primitives.
   - TanStack Query for server cache, Zustand for lightweight client state, React Hook Form + Zod for validation.
   - `next-pwa` (or custom worker) for offline caching, `quagga`/`jsQR` for barcode scanning.
2. **Backend**
   - Next.js route handlers with Prisma ORM and Supabase client for auth context.
   - Background automation via Supabase Edge Functions, Vercel Cron, or GitHub Actions.
3. **Dev Tooling**
   - ESLint, Prettier, Husky, lint-staged.
   - Vitest + Testing Library, Playwright for end-to-end POS flows, Storybook for component previews.
4. **Payments & Monitoring**
   - Static UPI QR per organization, optional Razorpay integration through API routes.
   - Supabase log drains to Slack, Vercel monitoring, optional Sentry/LogRocket.

## Database Schema
See [`supabase/schema.sql`](supabase/schema.sql) for the complete multi-tenant schema covering organizations, inventory, café POS, payments, and audit logs.

## Supabase RLS Policies
[`supabase/policies.sql`](supabase/policies.sql) enables RLS across tenant tables, ensures users access only their organization, and demonstrates role-based update rules for managers and owners.

## Frontend & Backend Folder Structure
```
root/
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ supabase/
│  ├─ schema.sql
│  └─ policies.sql
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ (auth)/
│  │  ├─ (tenant)/
│  │  │  ├─ inventory/
│  │  │  ├─ pos/
│  │  │  └─ settings/
│  │  └─ (marketing)/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ layout/
│  │  ├─ forms/
│  │  └─ charts/
│  ├─ hooks/
│  ├─ lib/
│  │  ├─ auth.ts
│  │  ├─ supabase-client.ts
│  │  ├─ prisma.ts
│  │  ├─ tenant.ts
│  │  ├─ offline-sync.ts
│  │  └─ printing.ts
│  ├─ server/
│  ├─ styles/
│  ├─ utils/
│  └─ workers/
│     ├─ service-worker.ts
│     └─ sync-worker.ts
├─ public/
│  ├─ icons/
│  ├─ manifest.json
│  ├─ sw.js
│  └─ print-templates/
├─ tests/
│  ├─ e2e/
│  └─ unit/
├─ scripts/
│  ├─ bootstrap.ts
│  └─ seed.ts
├─ .env.example
├─ package.json
└─ README.md
```

## Deployment Guide (Vercel + Supabase)
1. **Supabase Project**
   - Create project, enable PITR (paid tier) and note URL, anon, and service keys.
   - Execute `supabase/schema.sql` and `supabase/policies.sql` via Supabase SQL editor or CLI.
   - Configure Auth for magic link/OTP, domain allowlist, and custom JWT claim function to inject `org_id`/`role`.
2. **Repository & CI**
   - Initialize GitHub repo with Next.js + Prisma boilerplate.
   - Add Supabase secrets to GitHub for migrations if using CI.
   - Optional GitHub Actions workflow for lint/test/prisma migrate check.
3. **Vercel Deployment**
   - Import GitHub repo into Vercel (main branch for production).
   - Set environment variables from `.env.example` (without `NEXT_PUBLIC_` prefix where not needed).
   - Build command: `pnpm install && pnpm prisma generate && pnpm build` (adjust for npm/yarn).
   - Protect preview deployments if handling sensitive data.
4. **Custom Domain**
   - Add `app.mybrand.in` under Vercel Domains and update DNS to the provided CNAME.
   - Register domain in Supabase Auth redirect URLs and allowed origins.
5. **Monitoring & Backups**
   - Forward Supabase logs to Slack via webhook; configure alerts for slow queries and auth errors.
   - Schedule nightly `supabase db dump` or rely on PITR; archive dumps in Supabase Storage or external S3 bucket.
6. **Automations**
   - Configure Vercel Cron or Supabase Edge Functions for scheduled tasks (e.g., nightly reports, cleanup).

## Self-Hosted Deployment (Docker + Caddy)
The repository ships with a production-ready Docker toolchain for customers that prefer to host the PWA themselves or need an on-premise installation.

1. **Image Build**
   - `Dockerfile` targets a Next.js 14 standalone build. Build locally with:
     ```bash
     docker build --target runner -t ghcr.io/your-org/inventory-manager-app:latest .
     ```
   - The build stage installs dependencies, compiles the app, and prunes dev packages for a smaller runtime image.
2. **Environment Variables**
   - Populate the root `.env` (or create `.env.production`) with domain, Supabase, and payment secrets. These values are shared between the container and the app at runtime.
3. **Reverse Proxy & TLS**
   - `docker-compose.yml` runs two core services: the Next.js app (`app`) and Caddy (`caddy`).
   - `Caddyfile` terminates TLS using Let's Encrypt and proxies HTTPS traffic to the app container. Set `DOMAIN` and `EMAIL` in `.env` and ensure DNS A/AAAA records resolve to the host before starting the stack.
4. **Run the Stack**
   - Start the containers in detached mode:
     ```bash
     docker compose up -d
     ```
   - Verify health with `docker compose logs -f app` and hit `https://<DOMAIN>/api/health` once Caddy acquires certificates.
5. **Go-Live Checklist**
   - Update Supabase Auth redirect URLs to the new domain and rotate any secrets shared during testing.
   - Configure a firewall (allow 80/443) and optionally restrict management access via Tailscale or VPN.
   - Point CDN or DNS records (e.g., Cloudflare) to the Caddy host if you need additional WAF/caching.
6. **Backups & Cron (Optional Profile)**
   - The compose file defines `backup` (Supabase CLI) and `cron` (Ofelia scheduler) services behind the `backup` profile. Enable them with:
     ```bash
     docker compose --profile backup up -d
     ```
   - Provide `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `DATABASE_URL`, and a `BACKUP_SCHEDULE` (cron syntax) in `.env`. Dumps are written to `./backups` and can be rsynced to cold storage.
7. **CI/CD to GHCR**
   - `.github/workflows/docker.yml` builds the `runner` stage and pushes to GitHub Container Registry on every push to `main`, on tags prefixed with `v`, or via manual dispatch.
   - Set repository secrets (if you override registry credentials) and reuse the published image in Compose by replacing `IMAGE_NAME`/`IMAGE_TAG` in `.env`.

## Git Hosting & Repository Management
1. **Create the Remote**
   - Sign in to GitHub and create a new repository (private by default for staging assets).
   - Copy the repository SSH/HTTPS URL for use with the local project.
2. **Initialize & Link Locally**
   - Ensure Git is initialized (`git init`) and the current branch (`work`) contains your commits.
   - Add the remote: `git remote add origin <repo-url>` and verify with `git remote -v`.
3. **Version History Hygiene**
   - Create focused commits (`git add`, `git commit`) that map to features or fixes.
   - Use conventional commit messages or a documented style for easier changelog generation.
   - Run lint/tests locally or via `npm run lint` and future `npm run test` prior to pushing.
4. **Push & Protect**
   - Push the branch: `git push -u origin work` (or `main` when ready).
   - Enable branch protection on GitHub (require PR reviews, CI checks, signed commits as needed).
5. **Continuous Deployment Hooks**
   - Connect the GitHub repo to Vercel; each push to the production branch triggers a deploy.
   - Optionally configure Supabase GitHub integration or Supabase CLI in CI for migrations.
6. **Collaboration Workflow**
   - Use feature branches (`feature/pos-receipts`) and pull requests for review.
   - Tag releases (e.g., `v0.1.0`) once QA passes; Vercel can map tags to preview deployments.

## Local Development
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Generate Prisma client**
   ```bash
   npm run postinstall
   ```
3. **Run the dev server**
   ```bash
   npm run dev
   ```
4. **Lint the project**
   ```bash
   npm run lint
   ```
5. **Environment variables**
   - Copy `.env.example` to `.env.local` and populate Supabase + Razorpay credentials.
   - The app expects `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at minimum to render the auth form.

The marketing landing page is available at `http://localhost:3000`, the auth flow at `/login`, and sample tenant dashboard content at `/dashboard` under the `(tenant)` route group.

## PWA & Printing Setup
- **PWA**: Integrate `next-pwa` to compile a service worker handling asset/runtime caching. Use IndexedDB for offline data and Background Sync to flush queued orders and stock adjustments.
- **Offline UX**: Display connectivity banner, allow offline creation of orders, and reconcile when online. Provide manual conflict resolution for duplicate entries.
- **Barcode Scanning**: Use `quagga` (camera) with fallback manual entry; gracefully handle permission denials.
- **Printing**: Create print-friendly React routes for receipts (`/orders/[id]/print/receipt`) and invoices. Tailor CSS for 80 mm and A4 sizes, optionally integrate PrintNode/WebUSB for one-click printing.

## Client Onboarding Steps
1. **Create Organization & Users**: Admin portal provisions organization, invites owner via Supabase Auth magic link. Owner invites managers/staff and assigns roles.
2. **Import Master Data**: Provide CSV templates for products/suppliers. Upload through UI to API route parsing via `papaparse`, validated, and persisted with Prisma `createMany`.
3. **Configure Payments & Printers**: Upload static UPI QR, optionally add Razorpay credentials. Install printer drivers and run receipt/A4 test prints.
4. **Menu & POS Setup**: Build menus from inventory, configure table layout, taxes, discounts, and service charges.
5. **PWA Installation & Offline Demo**: Guide staff to install the PWA on Android/iOS/desktop. Demonstrate offline order capture and sync recovery.
6. **Test Transactions**: Simulate orders across payment modes, refund flows, and barcode-based stock adjustments.
7. **Daily Z Report Demo**: Walk through generating/exporting the Z report, email scheduling, and CSV exports for accounting.

## Pricing & Monetization
- **Core Plan**: ₹1,999/month per outlet including inventory, café POS, unlimited users.
- **Setup Fee**: ₹4,999 one-time for onboarding, device configuration, and menu import.
- **Add-ons**: Additional outlet ₹1,499/month, Razorpay integration ₹499/month, advanced analytics ₹999/month.
- Offer annual plan discount (e.g., 2 months free) and volume pricing for multi-location chains.

## Future Upgrades (mobile app, analytics, AI reports)
- **Flutter Mobile App**: Share Supabase auth/session management, reuse API endpoints, implement offline-first POS with `flutter_barcode_scanner` and push notifications for low stock/orders.
- **Advanced Analytics**: Connect Supabase to Metabase/Power BI or build custom dashboards for trend analysis, best sellers, wastage, and staff performance.
- **AI-Assisted Reports**: Leverage OpenAI to generate natural language summaries of daily performance, anomaly detection, and voice-driven queries.
- **Integrations & DevOps**: GST e-invoicing, accounting sync (Zoho, Tally), feature flag rollout, infrastructure-as-code via Supabase CLI + Terraform, automated load tests before releases.
