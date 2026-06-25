'use client';

import { Button } from '@heroui/react';
import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const DeliverButton = ({ transactionId }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDeliver = async () => {
        if (!transactionId) return;
        startTransition(async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/transactions/deliver/${transactionId}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        cache: 'no-store',
                    }
                );

                if (!res.ok) {
                    toast.error('Failed to mark as delivered.');
                    return;
                }

                toast.success('Order marked as delivered.');
                router.refresh();
            } catch (error) {
                console.error('Deliver error:', error);
                toast.error('Something went wrong.');
            }
        });
    };

    return (
        <Button
            color="success"
            variant="solid"
            size="sm"
            onPress={handleDeliver}
            isDisabled={isPending}
            isLoading={isPending}
        >
            {isPending ? 'Updating…' : 'Mark as Delivered'}
        </Button>
    );
};

export default DeliverButton;
