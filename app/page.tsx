import DashboardOverview from "./dashboard-client";

// Force static generation for instant initial load (Next.js 16 best practice)
export const dynamic = 'force-static';

export default function Page() {
    // Directly render the client component. 
    // It will fetch data from the Client Cache (which is now persistent).
    // Initial load will show the client-side loading state if cache is empty.
    return <DashboardOverview />;
}
