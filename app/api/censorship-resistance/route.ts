import { NextResponse } from 'next/server';
import { getCensorshipResistanceScore } from '@/server/api/decentralization';

export async function GET() {
    try {
        const data = await getCensorshipResistanceScore();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Censorship resistance error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
