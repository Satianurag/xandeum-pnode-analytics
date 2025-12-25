import { NextResponse } from 'next/server';
import { getDecentralizationMetrics } from '@/server/api/decentralization';

export async function GET() {
    try {
        const data = await getDecentralizationMetrics();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Decentralization error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
