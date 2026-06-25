'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Chip } from '@heroui/react';
import { FiShoppingBag } from 'react-icons/fi';
import WishlistButton from './WishlistButton';

const ProductCard = ({ product, userEmail = null, inWishlist = false }) => {
    const {
        _id,
        title = 'Untitled',
        price,
        category,
        images,
        image,
        quantity,
        description,
    } = product || {};

    const cover = images?.[0] || image;
    const out = typeof quantity === 'number' && quantity <= 0;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
            <Link href={`/products/${_id}`} className="block">
                <div className="relative aspect-[4/3] bg-gray-50">
                    {cover ? (
                        <Image
                            src={cover}
                            alt={title}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No image
                        </div>
                    )}
                    {out && (
                        <div className="absolute top-2 left-2">
                            <Chip color="danger" size="sm" variant="solid">
                                Sold out
                            </Chip>
                        </div>
                    )}
                    {category && (
                        <div className="absolute top-2 right-2">
                            <Chip color="primary" size="sm" variant="flat" className="capitalize">
                                {category}
                            </Chip>
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/products/${_id}`} className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-[#35858E]">
                            {title}
                        </h3>
                    </Link>
                    <WishlistButton
                        productId={_id}
                        userEmail={userEmail}
                        initiallyInWishlist={inWishlist}
                    />
                </div>

                {description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-lg font-black text-[#35858E]">
                        ${Number(price || 0).toFixed(2)}
                    </p>
                    <Link
                        href={`/products/${_id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#35858E] hover:bg-[#2b6d75] rounded-xl px-3 py-1.5 transition-colors"
                    >
                        <FiShoppingBag className="w-4 h-4" />
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;