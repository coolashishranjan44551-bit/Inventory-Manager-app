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

## Kubernetes Deployment (Optional Self-Hosting)

The repository includes a multi-stage Dockerfile that produces a minimal runtime image using Next.js' standalone output. Build a
 container image and push it to your registry:

```bash
docker build -t registry.example.com/inventory-manager:latest .
docker push registry.example.com/inventory-manager:latest
```

Example Kubernetes manifests live in [`k8s/`](k8s/). Apply the configuration after creating the ConfigMap and Secret with your S
upabase credentials and public URLs:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret-example.yaml  # rename to secret.yaml and replace placeholders first
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

The Deployment exposes the built-in health check at `/api/health` for readiness/liveness probes and publishes port 3000 via a C
lusterIP Service. Customize the Ingress host, TLS settings, replica count, and resource requests to fit your cluster.

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
