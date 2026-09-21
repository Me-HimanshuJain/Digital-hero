# 🏌️ Digital Heroes

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)

Digital Heroes is a modern, high-performance web platform for golfers. It allows users to log their golf scores, track their handicap index, and enter into secure, algorithmic monthly draws for cash prizes. A core component of the platform is philanthropy—users allocate a percentage of their subscription to a featured charity of their choice.

---

## 📖 Table of Contents
- [✨ Core Features](#-core-features)
- [🚀 Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🛠️ Local Development Setup](#️-local-development-setup)
- [📦 Environment Variables](#-environment-variables)
- [🔒 Security & Architecture](#-security--architecture)

---

## ✨ Core Features

- **Golf Score Tracking:** Users log their 18-hole scores (Score, Par, Course Rating, Slope Rating) to automatically calculate and track their exact Handicap Index.
- **Monthly Prize Draws:** Users who log at least 5 scores qualify for the monthly cryptographic draw system to win cash prizes.
- **Charity Integrations:** A portion (10%) of every user's subscription goes directly to a featured charity chosen by the user.
- **Winner Verification:** Secure proof-upload system (photos of scorecards) for winners before payouts are verified and processed by admins.
- **Subscription Management:** Automated Stripe integration for Monthly and Annual subscriptions.
- **Admin Dashboard:** Comprehensive dashboard to manage charities, review uploaded proofs, process payouts, and simulate draws.
- **Global Regions:** Region-specific pricing (GBP, INR, USD) dynamically adjusted based on the user's location.

---

## 🚀 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security + Storage)
- **Payments:** [Stripe](https://stripe.com/) (Subscriptions, Customer Portal, Webhooks)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📂 Project Structure

```text
├── scripts/                # Utility scripts (e.g., seeding Stripe products)
├── src/
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── admin/          # Admin Dashboard
│   │   ├── api/            # Stripe Webhooks & Portal
│   │   ├── auth/           # Authentication callbacks
│   │   ├── dashboard/      # User Dashboard (Scores, Draws, Charities)
│   │   └── pricing/        # Public pricing page
│   ├── components/         # Reusable React components (UI, Dashboard, Admin)
│   ├── lib/                # Utilities (Stripe config, Supabase clients, utils)
│   └── server/             # Server actions (Scores, Subscriptions)
├── supabase/
│   └── migrations/         # PostgreSQL schema, RLS policies, and triggers
└── public/                 # Static assets
```

---

## 🛠️ Local Development Setup

### 1. Supabase Setup
1. Create a new [Supabase project](https://database.new).
2. Run the SQL migrations found in `supabase/migrations/` sequentially in the Supabase SQL Editor to generate the schema, tables, policies, and triggers.
3. Grab your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings > API**.

### 2. Stripe Setup
1. Create a [Stripe account](https://dashboard.stripe.com/) and grab your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`.
2. Add the keys to your `.env.local` file.
3. Run `npm run seed:stripe` to automatically create the Monthly and Annual subscription products in your Stripe account and sync them to your Supabase database.
4. Set up a Webhook in the Stripe Dashboard pointing to `<your-domain>/api/webhooks/stripe` listening for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the Webhook Signing Secret (`whsec_...`) to your `.env.local`.

### 3. Running the App
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 📦 Environment Variables

Create a `.env.local` file in the root directory and populate it with the following:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Admin (Required for webhooks/scripts)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pricing (Generated by npm run seed:stripe)
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_...
```

---

## 🔒 Security & Architecture

- **Row Level Security (RLS):** All Supabase tables are heavily guarded using PostgreSQL RLS policies to ensure users can only read/write their own data.
- **Server Actions:** Secure server-side mutations are handled using Next.js Server Actions, bypassing the need for exposed API endpoints.
- **Webhook Verification:** Stripe webhooks strictly verify cryptographic signatures to prevent spoofing.
- **Storage Security:** Scorecard proofs are uploaded to a private Supabase Storage bucket accessible only by the user and verified administrators.

---
*Built for the future of digital philanthropy and golf.*
