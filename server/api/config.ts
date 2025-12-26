export const POD_CREDITS_API = process.env.POD_CREDITS_API_URL || 'https://podcredits.xandeum.network/api/pods-credits';
export const DEVNET_RPC = process.env.XANDEUM_DEVNET_RPC || 'https://api.devnet.xandeum.com:8899';
export const GEOLOCATION_API = process.env.GEOLOCATION_API_URL || 'http://ip-api.com/json'; // Note: http for free tier

// Data refresh every 5 minutes
export const REFRESH_INTERVAL = parseInt(process.env.DATA_REFRESH_INTERVAL_MS || '300000', 10);
export const CACHE_DURATION = parseInt(process.env.CACHE_DURATION_MS || '300000', 10);

