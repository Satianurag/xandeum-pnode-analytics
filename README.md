# Xandeum pNode Dashboard

This repository contains a Next.js-based dashboard for monitoring Xandeum pNodes.

The application focuses on operational visibility: node inventory, health, performance, decentralization metrics, and network status. It is designed to be deployable as an internal or operator-facing tool rather than a public marketing site.

## Core Capabilities

- **pNode overview**  
  Cluster-wide list of pNodes with key attributes and status.

- **Network & performance views**  
  Pages focused on network-level statistics, latency/throughput indicators, and historical performance.

- **Health & alerts**  
  Dedicated views for health signals and alert-style information useful for day‑to‑day operations.

- **Operator UX**  
  Responsive layout, keyboard- and mouse-friendly UI, dark theme, and a right‑hand sidebar with widgets, notifications, and chat.

## Technology Stack

- **Framework**: Next.js (App Router) with React and server components where appropriate
- **Language**: TypeScript
- **Styling**: Tailwind CSS and utility classes
- **UI Components**: shadcn/ui and Radix primitives
- **Data & State**:
  - Custom React hooks under `hooks/` for pNode data, network stats, etc.
  - TanStack Query for data fetching, caching, and background refresh
- **Backend & Integrations**:
  - pRPC client for accessing Xandeum network data
  - Supabase and Redis-backed caching (for notifications and other dashboard state)

## Requirements

- Node.js 20 or newer
- npm (or another compatible package manager)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd xandeum-pnode-analytics
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Copy the example environment file and adjust values as needed:

   ```bash
   cp .env.local.example .env.local
   ```

   Key variables (see `.env.local.example` for the full list):

   ```env
   # Supabase configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Data refresh configuration (in milliseconds)
   DATA_REFRESH_INTERVAL_MS=300000

   # Pod credits API
   POD_CREDITS_API_URL=https://podcredits.xandeum.network/api/pods-credits

   # Optional Xandeum RPC endpoint
   XANDEUM_DEVNET_RPC=https://api.devnet.xandeum.com:8899

   # Geolocation API used for node location enrichment
   GEOLOCATION_API_URL=http://ip-api.com/batch
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   By default the app listens on [http://localhost:5000](http://localhost:5000).

## Useful Scripts

- `npm run dev` – Start the development server
- `npm run build` – Create an optimized production build
- `npm run start` – Run the production server
- `npm run lint` – Run the configured ESLint rules

## Project Layout

High‑level layout (non‑exhaustive):

```text
├── app/                  # Next.js routes (App Router)
│   ├── page.tsx          # Main dashboard entry
│   ├── pnodes/           # pNode views (list, details)
│   ├── performance/      # Performance‑focused views
│   ├── network/          # Network‑level metrics
│   ├── health/           # Health views
│   └── alerts/           # Alerts and notifications pages
├── components/           # Reusable UI and dashboard components
├── contexts/             # React context providers (e.g., wallet, layout)
├── hooks/                # Custom hooks for data fetching and UI behavior
├── lib/                  # Shared utilities, API clients, configuration
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

## Deployment

The project targets modern Node-based hosting platforms (Vercel, containerized environments, or traditional Node process managers). A separate `DEPLOYMENT.md` file contains more specific guidance for production deployments.

## License

This codebase is private and proprietary unless otherwise stated in a separate license file or agreement.
