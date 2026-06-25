'use server';

import { revalidatePath } from 'next/cache';

export async function approveTransactionAction(transactionId) {
    if (!transactionId) return { ok: false, error: 'Missing transactionId' };

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/approve/${transactionId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            }
        );

        if (!res.ok) {
            return { ok: false, error: `Request failed with ${res.status}` };
        }

        revalidatePath('/dashboard/seller');
        return { ok: true };
    } catch (error) {
        console.error('Failed to approve transaction:', error);
        return { ok: false, error: error?.message || 'Unknown error' };
    }
}
