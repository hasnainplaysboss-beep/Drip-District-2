# Drip District — fresh storefront starter

A separate Next.js 15 / Prisma starter for the Drip District rebrand. It preserves the legacy YuseePlugs database identity in no way and **does not connect to or modify the old database until you configure it**.

## Included
- Black/white editorial responsive storefront and navigation
- Category/catalog routes (men, women, tech, accessories), shop, product page, brand page, search page
- Product/variant Prisma schema (brand, category, price, size, colour, delivery, stock, SKU)
- Featured product flag and home page featured-product query
- Customer registration/login session scaffold, logout endpoint, account route
- Admin login via environment-configured credentials, dashboard and admin product CRUD API
- Stripe Checkout session API (requires Stripe keys)
- Catalogue grounded chat API: basic matching against database catalog (not an LLM-powered conversational agent)
- Delivery, returns, FAQ, About, Contact pages
- Responsive CSS

## Important status
This is a substantial **starter project**, not a production-ready store. Before live use, add cart persistence and bag UI, customer order history/profile controls, webhook-driven stock/order updates, variant CRUD UI, proper admin product forms, robust chatbot integration and testing, spam/CSRF/rate limiting, policy copy, tax/shipping rules, email delivery, and audit logging. Admin credentials use env vars; change them before deployment. Don't treat Stripe checkout success redirect as proof of payment; implement and verify webhook events before fulfillment.

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and fill in secrets.
3. Install dependencies: `npm install`
4. Generate Prisma client: `npx prisma generate`
5. Apply schema to the database: `npx prisma db push` (only on a database you control; never run against your existing shop DB without a backup and review).
6. Seed the admin account: `npm run db:seed`
7. Run locally: `npm run dev`

## Environment
`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`. Chatbot API is catalogue-matching without external AI; `OPENAI_API_KEY` is reserved for a future integration.

## Deployment
Deploy to a **new project** and use a **new database** for this starter, so it remains isolated from the existing YuseePlugs site while you test. Configure environment variables on the deployment host. The build script intentionally does only `prisma generate && next build` and does not push schema changes during deployment.
