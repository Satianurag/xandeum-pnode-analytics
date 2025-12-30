import DashboardOverview from "./dashboard-client";

// Allow static optimization or default dynamic behavior (non-blocking)
// export const dynamic = 'force-dynamic'; // Removed to prevent blocking SSR

export default function Page() {
    // Directly render the client component. 
    // It will fetch data from the Client Cache (which is now persistent).
    // Initial load will show the client-side loading state if cache is empty.
    return <DashboardOverview />;
}
