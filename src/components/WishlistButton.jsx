'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiHeart } from 'react-icons/fi';

const WishlistButton = ({ productId, userEmail, initiallyInWishlist = false, size = 'sm', variant = 'flat' }) => {
    const router = useRouter();
    const [active, setActive] = useState(Boolean(initiallyInWishlist));
    const [isPending, startTransition] = useTransition();

    // Re-sync if the parent passes a fresh prop
    useEffect(() => {
        setActive(Boolean(initiallyInWishlist));
    }, [initiallyInWishlist, productId]);

    if (!userEmail) {
        return (
            <button
                type="button"
                disabled
                aria-label="Login required"
                title="Log in to save items"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
            >
                <FiHeart className="w-4 h-4" />
            </button>
        );
    }

    const handleToggle = async () => {
        const next = !active;
        // optimistic toggle
        setActive(next);

        try {
            if (next) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userEmail, productId: String(productId) }),
                });
                if (!res.ok) throw new Error('Add failed');
                toast.success('Added to wishlist');
            } else {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${encodeURIComponent(userEmail)}/${encodeURIComponent(productId)}`,
                    { method: 'DELETE' }
                );
                if (!res.ok) throw new Error('Remove failed');
                toast.success('Removed from wishlist');
            }
            startTransition(() => router.refresh());
        } catch (err) {
            console.error(err);
            // revert on failure
            setActive(!next);
            toast.error('Failed to update wishlist');
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            aria-pressed={active}
            aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
            title={active ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`inline-flex items-center justify-center gap-1 rounded-full transition-all duration-200 ${
                size === 'sm' ? 'w-9 h-9' : 'px-3 py-1.5 text-sm font-semibold'
            } ${
                active
                    ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100'
                    : 'bg-white text-gray-500 border border-gray-200 hover:text-pink-500 hover:border-pink-200'
            }`}
        >
            <FiHeart className={active ? 'fill-pink-500 text-pink-500 w-4 h-4' : 'w-4 h-4'} />
            {size !== 'sm' && (active ? 'Saved' : 'Save')}
        </button>
    );
};

export default WishlistButton;