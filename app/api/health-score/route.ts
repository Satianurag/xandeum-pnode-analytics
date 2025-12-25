import { NextResponse } from 'next/server';
import { getHealthScoreBreakdown } from '@/server/api/decentralization';

export async function GET() {
    try {
        const data = await getHealthScoreBreakdown();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Health score error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
