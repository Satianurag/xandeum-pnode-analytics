import { NextResponse } from 'next/server';
import { getPeerRankings } from '@/server/api/decentralization';

export async function GET() {
    try {
        const data = await getPeerRankings();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Peer rankings error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
