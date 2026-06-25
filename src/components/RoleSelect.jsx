'use client';

import { Button, Select, ListBox, Spinner } from '@heroui/react';
import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ROLES = ['user', 'seller', 'admin', 'deliveryman'];

const RoleSelect = ({ userId, currentRole = 'user' }) => {
    const router = useRouter();
    const [role, setRole] = useState(currentRole);
    const [isPending, startTransition] = useTransition();

    // Sync local state if the prop changes from a server refetch
    useEffect(() => {
        setRole(currentRole);
    }, [currentRole]);

    const handleUpdate = () => {
        if (!userId) {
            toast.error('Invalid user ID.');
            return;
        }
        
        startTransition(async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/users/role/${userId}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role }),
                    }
                );
                
                if (!res.ok) {
                    throw new Error('Failed to update role.');
                }
                
                toast.success(`Role updated to ${role}.`);
                router.refresh();
            } catch (error) {
                console.error('Role update failed:', error);
                toast.error('Something went wrong.');
                setRole(currentRole); // Revert UI state on failure
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            {/* 1. Controlled via value and onChange in v3 */}
            <Select
                aria-label="Role"
                value={role}
                onChange={(val) => {
                    // Mimics disallowEmptySelection by checking if val exists
                    if (val) setRole(val);
                }}
                className="min-w-[140px]"
                variant="secondary"
            >
                {/* 2. Compound sub-components control layout & sizing */}
                <Select.Trigger className="h-8 text-sm px-2">
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {ROLES.map((r) => (
                            // 3. v3 uses 'id' for selection state and 'textValue' for accessibility
                            <ListBox.Item 
                                key={r} 
                                id={r} 
                                textValue={r} 
                                className="capitalize text-sm"
                            >
                                {r}
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>

            <Button
                size="sm"
                variant="primary" // 4. 'color' prop removed; color variant mapped here
                onPress={handleUpdate}
                isDisabled={isPending || role === currentRole || !userId}
                isPending={isPending} // 5. 'isLoading' renamed to 'isPending'
            >
                {/* 6. Render prop pattern to conditionally insert the Spinner */}
                {({ isPending }) => (
                    <span className="flex items-center gap-1.5">
                        {isPending && <Spinner size="sm" color="current" />}
                        Save
                    </span>
                )}
            </Button>
        </div>
    );
};

export default RoleSelect;