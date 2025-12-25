import { NextResponse } from 'next/server';

// XAND Token mint address on Solana
const XAND_MINT = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';

// Jupiter Price API endpoints (try multiple)
const PRICE_APIS = [
    `https://price.jup.ag/v6/price?ids=${XAND_MINT}&vsToken=USDC`,
    `https://api.jup.ag/price/v2?ids=${XAND_MINT}`,
];

export async function GET() {
    // Try each API endpoint
    for (const apiUrl of PRICE_APIS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'XandeumAnalytics/1.0',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const data = await response.json();
            const priceData = data.data?.[XAND_MINT];

            if (priceData?.price) {
                return NextResponse.json({
                    price: priceData.price,
                    mintSymbol: priceData.mintSymbol || 'XAND',
                    vsToken: priceData.vsToken || 'USDC',
                    vsTokenSymbol: priceData.vsTokenSymbol || 'USDC',
                    source: 'jupiter',
                });
            }
        } catch (error) {
            // Continue to next API if this one fails
            console.warn(`XAND price API failed for ${apiUrl}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }

    // All APIs failed - return not found (client handles gracefully)
    return NextResponse.json(
        { error: 'Price temporarily unavailable', price: null },
        { status: 503 }
    );
}
