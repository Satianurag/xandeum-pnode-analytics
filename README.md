# Xandeum pNode Analytics

![License](https://img.shields.io/badge/license-Private-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

Analytics platform for Xandeum pNodes. Monitor, analyze, and track pNode performance, decentralization metrics, and network health on the Xandeum network.

## 🚀 Features

*   **Real-time Analytics**: Comprehensive dashboard for monitoring pNode performance and network statistics.
*   **Interactive Visualizations**: Dynamic charts and graphs powered by Recharts and Framer Motion.
*   **Global Node Map**: Geographic distribution of nodes visualized using Leaflet.
*   **Wallet Integration**: Seamless Solana wallet connection for user interactions.
*   **Community Chat**: Integrated chat system with mobile support.
*   **Responsive Design**: Fully responsive layout optimized for both desktop and mobile devices.
*   **Dark Mode**: Sleek dark-themed UI built with Tailwind CSS and Shadcn UI.

## 🛠 Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand), [TanStack Query](https://tanstack.com/query/latest)
*   **Backend & Data**: [Supabase](https://supabase.com/), [xandeum-prpc](https://www.npmjs.com/package/xandeum-prpc)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

*   Node.js 20+
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd xandeum-pnode-analytics
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy the example environment file:
    ```bash
    cp .env.local.example .env.local
    ```
    
    Fill in the required environment variables in `.env.local`:
    ```env
    # Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

    # Data Refresh Configuration
    DATA_REFRESH_INTERVAL_MS=300000

    # Pod Credits API
    POD_CREDITS_API_URL=https://podcredits.xandeum.network/api/pods-credits

    # Xandeum RPC (Optional)
    XANDEUM_DEVNET_RPC=https://api.devnet.xandeum.com:8899

    # Geolocation API
    GEOLOCATION_API_URL=http://ip-api.com/batch
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

## 📜 Scripts

*   `npm run dev`: Runs the development server on port 5000.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Runs ESLint to check for code quality issues.

## 📦 Deployment

For detailed deployment instructions, please refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

The project is optimized for deployment on Vercel but can also be hosted via Docker or PM2.

### Vercel (Recommended)

1.  Push your code to a Git repository.
2.  Import the project into Vercel.
3.  Add the environment variables from `.env.local`.
4.  Deploy.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI primitives
│   ├── dashboard/        # Dashboard-specific components
│   └── chat/             # Chat feature components
├── contexts/             # React Context providers (Wallet, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── public/               # Static assets (fonts, images)
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

## 📄 License

This project is private and proprietary.
