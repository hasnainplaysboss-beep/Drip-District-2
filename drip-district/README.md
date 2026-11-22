# Drip District

A fresh Next.js App Router / TypeScript storefront starter styled around the supplied Drip District references.

## Requirements
- Node.js 20.9 or newer
- PostgreSQL database (Neon is supported)
- Stripe account for live checkout

## Local setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (32+ random characters), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `STRIPE_SECRET_KEY`, and `STORE_URL`.
3. Install dependencies: `npm install`
4. Generate Prisma client: `npm run db:generate`
5. Apply reviewed migrations: `npm run db:migrate`
6. Start: `npm run dev`

## Vercel
- Import this repository into Vercel.
- Framework preset: Next.js.
- Root directory: project root.
- Add environment variables in Vercel for Production, Preview and Development as appropriate.
- Build command: `npm run build`.
- Do not run `prisma db push` automatically in a production build. Use reviewed migrations only.
- Deploy after a successful local `npm run typecheck` and `npm run build`.

## Important launch checklist
This is a new project foundation, not a verified live retail operation. Before taking real orders:
- Configure Stripe keys and create a webhook endpoint at `/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, and `checkout.session.async_payment_failed`. Add `STRIPE_WEBHOOK_SECRET` to Vercel.
- Checkout creates a pending order record and the webhook updates its payment status. It does not yet reserve/decrement inventory transactionally; implement stock reservation and idempotent fulfilment before live sales.
- Add customer registration/login, account security and order history; customer auth is not included in this starter.
- Complete admin CRUD and role-based customer/order/revenue workflows. Admin API endpoints now provide product create/update/archive, customer list/ban/role changes, order list/status/tracking updates, and revenue totals. The dashboard UI still needs polished management screens and refund integration.
- Implement product filters against real database queries, reviews with verified-purchase checks/moderation, wishlists, discount validation, tracking/refund provider workflows, transactional email and customer notification preferences.
- Configure an email provider, analytics with consent, cookie consent manager, backups, monitoring, VAT/tax and legal policies.
- Confirm UK/China delivery rates, delivery estimates, customs/import charges and return rules with your fulfilment providers.
- Replace sample/remote campaign imagery with licensed brand assets and add the supplied Drip District logo artwork.
- Review payment provider eligibility and all applicable consumer, privacy and tax obligations before launch.

## Database safety
The build script runs `prisma generate` only. It never changes your database schema. Use versioned Prisma migrations after reviewing them against your existing database.
