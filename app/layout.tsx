import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { V0Provider } from "@/lib/v0-context";
import localFont from "next/font/local";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { QueryProvider } from "@/lib/query-provider";
import { WalletContextProvider } from "@/contexts/wallet-context";
import { NetworkMarquee } from "@/components/dashboard/network-marquee";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports for heavy components
import { JitWrapper } from "@/components/ui/jit-wrapper";
const DashboardSidebar = dynamic(() => import("@/components/dashboard/sidebar").then(mod => mod.DashboardSidebar));

const Widget = dynamic(() => import("@/components/dashboard/widget"), {
  loading: () => <Skeleton className="h-32 rounded-lg bg-accent/20" />
});

const Notifications = dynamic(() => import("@/components/dashboard/notifications"), {
  loading: () => <Skeleton className="h-32 rounded-lg bg-accent/20" />
});

const Chat = dynamic(() => import("@/components/chat"), {
  loading: () => <Skeleton className="h-48 rounded-lg bg-accent/20" />
});

const MobileChat = dynamic(() => import("@/components/chat/mobile-chat").then(mod => mod.MobileChat));
// LiveNetworkPulse moved to app/page.tsx for performance
// LiveNetworkPulse moved to app/page.tsx for performance

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
});

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false;

export const metadata: Metadata = {
  title: {
    template: "%s – Xandeum pNode Dashboard",
    default: "Xandeum pNode Dashboard",
  },
  description:
    "Operational dashboard for Xandeum pNodes. Monitor node inventory, performance, and network health on the Xandeum network.",
  generator: 'Xandeum Labs',
  metadataBase: new URL('http://localhost:5000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to map tile CDN - improves LCP by ~80ms */}
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://c.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://d.basemaps.cartocdn.com" crossOrigin="anonymous" />

        {/* DNS prefetch as fallback */}
        <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />

        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="pNode Dashboard" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Font optimization handled by next/font/local */}
      </head>
      <body
        className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}
      >
        <V0Provider isV0={isV0}>
          <QueryProvider>
            <WalletContextProvider>
              <SidebarProvider>
                {/* Accessibility: Skip to main content link */}
                <a href="#main-content" className="skip-link">
                  Skip to main content
                </a>

                {/* Mobile Header - only visible on mobile */}
                <MobileHeader />

                {/* Desktop Layout */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides">
                  <div className="hidden lg:block col-span-2 top-0 relative">
                    <DashboardSidebar />
                  </div>
                  <main id="main-content" className="col-span-1 lg:col-span-7">{children}</main>
                  <div className="col-span-3 hidden lg:block">
                    <div className="fixed right-[var(--sides)] top-0 bottom-6 w-[calc((100vw-var(--sides)*2-var(--gap)*2)/12*3)] space-y-gap pt-sides overflow-clip">
                      <JitWrapper fallback={<Skeleton className="h-32 rounded-lg bg-accent/20" />}>
                        <Widget />
                      </JitWrapper>
                      <JitWrapper fallback={<Skeleton className="h-32 rounded-lg bg-accent/20" />}>
                        <Notifications />
                      </JitWrapper>
                      <JitWrapper fallback={<Skeleton className="h-48 rounded-lg bg-accent/20" />}>
                        <Chat />
                      </JitWrapper>
                    </div>
                  </div>
                </div>

                {/* LiveNetworkPulse moved to dashboard page for performance */}

                {/* Network Stats Marquee - fixed at bottom */}
                <NetworkMarquee />

                {/* Mobile Chat - floating CTA with drawer */}
                <MobileChat />
              </SidebarProvider>
            </WalletContextProvider>
          </QueryProvider>
        </V0Provider>
        <SpeedInsights />
      </body>
    </html>
  );
}
