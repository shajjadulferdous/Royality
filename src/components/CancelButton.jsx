'use client';

import { Button } from '@heroui/react';
import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelTransactionAction } from '@/app/actions/cancelTransaction';

const CancelButton = ({ transactionId }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCancel = () => {
        if (!transactionId) return;
        startTransition(async () => {
            const result = await cancelTransactionAction(transactionId);
            if (result?.ok) {
                router.refresh();
            }
        });
    };

    return (
        <Button
            color="danger"
            variant="solid"
            size="sm"
            onPress={handleCancel}
            isDisabled={isPending}
            isLoading={isPending}
        >
            {isPending ? 'Cancelling…' : 'Cancel'}
        </Button>
    );
};

export default CancelButton;