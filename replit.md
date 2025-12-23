# Xandeum pNode Analytics Platform

## Overview
A comprehensive Web3 storage node monitoring dashboard for the Xandeum network. Features real Solana wallet integration, multi-channel alert system, immersive 3D network visualization, proprietary X-Score mechanism for storage-specific metrics, Live Network Pulse footer displaying real-time gossip events, and Exabyte Growth Projection dashboard. Maintains a cyberpunk design aesthetic throughout.

## Project State
- **Status**: Active Development
- **Last Updated**: December 22, 2025
- **Framework**: Next.js 16 with TypeScript

## Recent Changes (December 22, 2025)
- Added Solana wallet integration with Phantom/Solflare support
- Created 3D Globe visualization with Three.js (with 2D fallback for WebGL-unsupported environments)
- Implemented X-Score proprietary scoring system for storage nodes
- Added Live Network Pulse footer with real-time gossip event marquee
- Created Alerts page with multi-channel webhook support (Discord/Telegram/Slack)
- Created Exabyte Projections page with storage growth simulator
- Enhanced Health Score page with peer rankings and slashing events
- Enhanced Decentralization page with superminority analysis and censorship resistance score
- Updated sidebar with wallet connect component and new navigation items

## Key Features

### Pages (12 Total)

#### Overview Section
1. **Dashboard** (`/`) - Network summary with orbital network graph, live stats, and performance charts
2. **pNodes** (`/pnodes`) - Advanced searchable/filterable table with multi-node comparison (up to 3 nodes)

#### Network Section
3. **Topology** (`/network`) - Network topology with constellation graph, gossip protocol status, peer distribution
4. **Performance** (`/performance`) - Leaderboards, performance tier distribution, latency trends
5. **Health Score** (`/health`) - Composite health scoring similar to Stakewiz Wiz Score, radar chart, factor breakdown

#### Economics Section
6. **Staking** (`/staking`) - Total staked, APY tracking, commission distribution, top validators, rewards calculator
7. **Epochs** (`/epochs`) - Current epoch progress, block production history, skip rate tracking, rewards per epoch

#### Infrastructure Section
8. **Decentralization** (`/decentralization`) - Nakamoto coefficient, Gini coefficient, geographic/datacenter/ASN distribution
9. **Versions** (`/versions`) - Software version distribution, upgrade progress tracking, outdated node alerts

#### Analytics Section
10. **Analytics** (`/analytics`) - Trend analysis, storage growth, network projections

#### Tools Section
11. **Alerts** (`/alerts`) - Multi-channel alert system with Discord/Telegram/Slack webhook support
12. **Projections** (`/projections`) - Exabyte growth simulator with node count sliders and milestones

### Web3 Features
- **Solana Wallet Integration**: Connect Phantom, Solflare, or other Solana wallets
- **Wallet Balance Display**: Shows SOL balance in sidebar profile
- **X-Score System**: Proprietary scoring for storage throughput + data availability latency
- **Live Network Pulse**: Footer marquee displaying real-time gossip events

### Alert System
- **Alert Types**: Uptime, Latency, Score, Commission changes
- **Severity Levels**: Info, Warning, Critical
- **Channels**: In-app, Discord webhooks, Telegram, Slack
- **History**: Full alert history with acknowledgment tracking

### Advanced Search Features
- Multi-filter support (pubkey, location, status, performance, storage, version, latency)
- Popover-based filter interface
- Real-time filtering with count indicators
- Clear filters with one click

### Node Comparison
- Select up to 3 nodes for side-by-side comparison
- Compare score, uptime, latency, storage, peers, commission

### Real-time Features
- Live clock with user timezone detection
- 30-second auto-refresh with intelligent caching
- Connection status indicator with last update timestamp
- Network events panel with real-time notifications

### Visualization
- Orbital/constellation network graph replacing world map
- Performance charts with multiple metric views
- Radar charts for health factor analysis
- Color-coded status indicators (Online/Degraded/Offline)
- Performance scoring system (Excellent/Good/Fair/Poor)

## Architecture

### Data Flow
```
Xandeum pRPC API → pnode-api.ts → use-pnode-data.ts hooks → React components
```

### Key Files
- `types/pnode.ts` - TypeScript interfaces for all pNode data types
- `lib/pnode-api.ts` - API client with caching, fallback data, and all data fetching functions
- `hooks/use-pnode-data.ts` - React hooks for data fetching with auto-refresh
- `components/dashboard/network-graph/index.tsx` - Orbital/constellation network visualization
- `components/dashboard/node-search/index.tsx` - Advanced multi-filter search component
- `components/dashboard/sidebar/index.tsx` - Organized navigation with groups

### Page Files
- `app/page.tsx` - Overview dashboard
- `app/pnodes/page.tsx` - pNode listing with advanced search
- `app/network/page.tsx` - Network topology view
- `app/performance/page.tsx` - Performance leaderboards
- `app/health/page.tsx` - Health score analysis
- `app/staking/page.tsx` - Staking economics
- `app/epochs/page.tsx` - Epoch tracking
- `app/decentralization/page.tsx` - Decentralization metrics
- `app/versions/page.tsx` - Version distribution
- `app/analytics/page.tsx` - Analytics and trends

### API Configuration
- **Endpoint**: `https://api.devnet.xandeum.com:8899`
- **Cache Duration**: 25 seconds
- **Refresh Interval**: 30 seconds
- **Fallback**: Generated network data (120-150 nodes) when API unavailable

## Performance Scoring (Similar to Stakewiz)
Nodes are scored 0-100 based on weighted factors:
- Uptime (25%)
- Latency (20%)
- Availability (20%)
- Gossip Health (15%)
- Storage Performance (10%)
- Peer Connections (10%)

### Tiers
- Excellent (A+): 90+
- Good (A/B): 75-89
- Fair (C): 60-74
- Poor (D): <60

## Sidebar Organization
- **OVERVIEW**: Dashboard, pNodes
- **NETWORK**: Topology, Performance, Health Score
- **ECONOMICS**: Staking, Epochs
- **INFRASTRUCTURE**: Decentralization, Versions
- **TOOLS**: Alerts, Projections
- **STATUS**: Connection indicator
- **WALLET**: Solana wallet connect/disconnect with balance display

## Design System
- Cyberpunk aesthetic with dark theme
- Accent color: Blue/Cyan glowing effects (#00ff88 primary)
- Font: Rebel Grotesk display, Roboto Mono monospace
- Animations: Framer Motion for smooth transitions
- Interactive elements with hover states and transitions

## Environment Variables
None required - API is public

## Development
```bash
npm run dev  # Starts on port 5000
```

## Notes
- Chart width/height warnings are cosmetic and resolve on interaction
- WebSocket HMR errors in development are expected (Replit proxy limitation)
- API fallback generates realistic network data for demo purposes
- Each page displays unique data to avoid duplication
