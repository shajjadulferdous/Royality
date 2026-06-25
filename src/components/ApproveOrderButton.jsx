'use client';

import { Button } from '@heroui/react';
import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveTransactionAction } from '@/app/actions/approveTransaction';
import toast from 'react-hot-toast';

const ApproveOrderButton = ({ transactionId }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        if (!transactionId) return;
        startTransition(async () => {
            const result = await approveTransactionAction(transactionId);
            if (result?.ok) {
                toast.success('Order approved for delivery.');
                router.refresh();
            } else {
                toast.error(result?.error || 'Failed to approve order.');
            }
        });
    };

    return (
        <Button
            color="primary"
            variant="solid"
            size="sm"
            onPress={handleApprove}
            isDisabled={isPending}
            isLoading={isPending}
        >
            {isPending ? 'Approving…' : 'Approve for Delivery'}
        </Button>
    );
};

export default ApproveOrderButton;
