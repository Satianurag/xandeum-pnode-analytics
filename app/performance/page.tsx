import PerformanceClient from "./performance-client";

// Allow static optimization or default dynamic behavior (non-blocking)
// export const dynamic = 'force-dynamic'; // Removed to prevent blocking SSR

export default function Page() {
  // Directly render the client component.
  // It will fetch data from the Client Cache (which is now persistent).
  return <PerformanceClient />;
}
