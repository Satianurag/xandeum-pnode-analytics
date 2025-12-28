import { NextResponse } from 'next/server';
import { redis, CACHE_KEYS } from '@/lib/redis';
import type { PNode } from '@/types/pnode';

export interface OperatorVerification {
    isOperator: boolean;
    node?: {
        pubkey: string;
        status: string;
        credits: number;
        creditsRank: number;
        location?: {
            country: string;
            city: string;
        };
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const walletPubkey = searchParams.get('pubkey');

        if (!walletPubkey) {
            return NextResponse.json({ isOperator: false });
        }

        // Upstash auto-parses JSON
        const cached = await redis.get(CACHE_KEYS.PNODES);

        if (!cached) {
            return NextResponse.json({ isOperator: false });
        }

        const nodes: PNode[] = typeof cached === 'string' ? JSON.parse(cached) : cached;
        const node = nodes.find(n => n.pubkey === walletPubkey);

        if (!node) {
            return NextResponse.json({ isOperator: false });
        }

        return NextResponse.json({
            isOperator: true,
            node: {
                pubkey: node.pubkey,
                status: node.status,
                credits: node.credits || 0,
                creditsRank: node.creditsRank || 0,
                location: node.location,
            },
        });
    } catch (err) {
        console.error('Verify operator error:', err);
        return NextResponse.json({ isOperator: false });
    }
}
