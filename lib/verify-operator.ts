import { supabase } from '@/lib/supabase';
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

/**
 * Verifies if a wallet pubkey belongs to a registered pNode operator
 * by checking the pnodes table in Supabase
 */
export async function verifyNodeOperator(walletPubkey: string): Promise<OperatorVerification> {
    if (!walletPubkey) {
        return { isOperator: false };
    }

    try {
        const { data, error } = await supabase
            .from('pnodes')
            .select('pubkey, status, credits, credits_rank, location')
            .eq('pubkey', walletPubkey)
            .single();

        if (error || !data) {
            return { isOperator: false };
        }

        return {
            isOperator: true,
            node: {
                pubkey: data.pubkey,
                status: data.status,
                credits: data.credits,
                creditsRank: data.credits_rank,
                location: data.location,
            },
        };
    } catch (err) {
        console.error('Error verifying node operator:', err);
        return { isOperator: false };
    }
}

/**
 * Truncates a wallet address for display
 * Example: "7xKXtg...9pQr"
 */
export function truncateAddress(address: string, chars = 6): string {
    if (!address) return '';
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-4)}`;
}
