'use client';

import React, { useTransition, useState } from 'react';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiLock, FiUnlock } from 'react-icons/fi';

const BlockToggle = ({ userId, initialBlock = false }) => {
    const router = useRouter();
    const [blocked, setBlocked] = useState(Boolean(initialBlock));
    const [isPending, startTransition] = useTransition();

    const handleToggle = async () => {
        const next = !blocked;
        const promise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/block/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ block: next }),
        }).then(async (res) => {
            if (!res.ok) throw new Error('Request failed');
            return res.json();
        });

        try {
            await toast.promise(promise, {
                loading: next ? 'Blocking user…' : 'Unblocking user…',
                success: next ? 'User blocked' : 'User unblocked',
                error: 'Failed to update block state',
            });
            setBlocked(next);
            startTransition(() => router.refresh());
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Button
            size="sm"
            variant={blocked ? 'flat' : 'solid'}
            color={blocked ? 'success' : 'danger'}
            onPress={handleToggle}
            isDisabled={isPending}
            startContent={blocked ? <FiUnlock /> : <FiLock />}
            className="capitalize font-semibold"
        >
            {blocked ? 'Unblock' : 'Block'}
        </Button>
    );
};

export default BlockToggle;
