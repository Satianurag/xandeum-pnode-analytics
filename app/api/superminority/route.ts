import { NextResponse } from 'next/server';
import { getSuperminorityInfo } from '@/server/api/decentralization';

export async function GET() {
    try {
        const data = await getSuperminorityInfo();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Superminority error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
