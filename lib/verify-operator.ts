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
 * by calling the server-side API route
 */
export async function verifyNodeOperator(walletPubkey: string): Promise<OperatorVerification> {
    if (!walletPubkey) {
        return { isOperator: false };
    }

    try {
        const res = await fetch(`/api/verify-operator?pubkey=${encodeURIComponent(walletPubkey)}`);

        if (!res.ok) {
            return { isOperator: false };
        }

        return await res.json();
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
