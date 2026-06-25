'use client';

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const AddCardList = ({ productId }) => {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        data: session,
        isPending
    } = authClient.useSession();

    const handleAddWishlist = async () => {
        if (!session?.user?.email) {
            toast.error("Please login first");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${session.user.email}/${productId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Something went wrong");
                return;
            }

            if (data.message === "Already in wishlist") {
                toast.error("Already added to wishlist");
                // setAdded(true);
                return;
            }

            setAdded(true);
            toast.success("Added to wishlist");

        } catch (error) {
            console.error(error);
            toast.error("Failed to add wishlist");
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <Button isDisabled>
                Loading...
            </Button>
        );
    }

    return (
        <Button
            variant="solid"
            onClick={handleAddWishlist}
            isDisabled={loading || added}
            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#35858E] rounded-xl hover:bg-[#35858E]/90 transition-colors duration-200"
        >
            <FiShoppingCart />

            {loading
                ? "Adding..."
                : added
                    ? "Added ✓"
                    : "Add to Cart"}
        </Button>
    );
};

export default AddCardList;