'use server';

import { revalidatePath } from 'next/cache';

export async function cancelTransactionAction(transactionId) {
    if (!transactionId) return { ok: false, error: 'Missing transactionId' };

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/cancel/${transactionId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store'
            }
        );

        if (!res.ok) {
            return { ok: false, error: `Request failed with ${res.status}` };
        }

        // Refresh the transactions page so the row reflects the new status
        revalidatePath('/dashboard/user/transactions');
        return { ok: true };
    } catch (error) {
        console.error('Failed to cancel transaction:', error);
        return { ok: false, error: error?.message || 'Unknown error' };
    }
}