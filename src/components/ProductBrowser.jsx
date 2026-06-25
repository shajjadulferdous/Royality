'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Chip } from '@heroui/react';
import { FiAlertCircle, FiArrowRight, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { LuPackageSearch } from 'react-icons/lu';
import WishlistButton from '@/components/WishlistButton';

const SORT_OPTIONS = [
  
    { value: 'price-asc', label: 'Price: low to high' },
    { value: 'price-desc', label: 'Price: high to low' },
    { value: 'title-asc', label: 'Name: A → Z' },
];

const currency = (n) =>
    `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductBrowser = ({ initialProducts = [], fetchError = null }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('newest');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [wishlistIds, setWishlistIds] = useState(new Set());

    // Load session + wishlist ids so the heart shows the right state
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const sessionRes = await fetch('/api/auth/get-session', { cache: 'no-store' }).catch(() => null);
                const session = sessionRes && sessionRes.ok ? await sessionRes.json() : null;
                const email = session?.user?.email || null;
                if (cancelled) return;
                setUserEmail(email);
                if (!email) return;

                const wlRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${encodeURIComponent(email)}`
                );
                const wlData = wlRes.ok ? await wlRes.json() : { items: [] };
                const ids = new Set(
                    (Array.isArray(wlData?.items) ? wlData.items : []).map((it) => String(it.productId))
                );
                if (!cancelled) setWishlistIds(ids);
            } catch (err) {
                console.error('Session/wishlist load failed', err);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const categories = useMemo(() => {
        const set = new Set();
        for (const p of initialProducts) {
            if (p?.category) set.add(p.category);
        }
        return ['all', ...Array.from(set).sort()];
    }, [initialProducts]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = initialProducts.filter((p) => {
            if (category !== 'all' && (p?.category || '').toLowerCase() !== category.toLowerCase()) return false;
            if (inStockOnly && Number(p?.quantity || 0) <= 0) return false;
            if (!q) return true;
            return (
                (p?.title || '').toLowerCase().includes(q) ||
                (p?.description || '').toLowerCase().includes(q) ||
                (p?.category || '').toLowerCase().includes(q)
            );
        });

        list = [...list].sort((a, b) => {
            if (sort === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
            if (sort === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
            if (sort === 'title-asc') return (a.title || '').localeCompare(b.title || '');
            // newest first
            const ad = a._id ? new Date(typeof a._id === 'string' ? a._id.substring(0, 8) : '').getTime() || 0 : 0;
            const bd = b._id ? new Date(typeof b._id === 'string' ? b._id.substring(0, 8) : '').getTime() || 0 : 0;
            return bd - ad;
        });
        return list;
    }, [initialProducts, query, category, sort, inStockOnly]);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center">
                        <LuPackageSearch className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1">
                            Browse the full catalog — filter by category, search by name, sort by price.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Chip color="primary" variant="flat" size="sm">
                        {visible.length} {visible.length === 1 ? 'item' : 'items'}
                    </Chip>
                    {initialProducts.length > 0 && (
                        <Chip color="default" variant="flat" size="sm">
                            {initialProducts.length} total
                        </Chip>
                    )}
                </div>
            </div>

            {/* Search + Filter bar */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center mb-6">
                <div className="md:col-span-5">
                    <label className="relative block">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FiSearch className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products by name, description, or category…"
                            className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#35858E] focus:ring-2 focus:ring-[#35858E]/20 outline-none text-sm"
                        />
                    </label>
                </div>

                <div className="md:col-span-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#35858E] outline-none text-sm capitalize"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c} className="capitalize">
                                {c === 'all' ? 'All categories' : c}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#35858E] outline-none text-sm"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2 select-none cursor-pointer h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 w-full">
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="rounded text-[#35858E] focus:ring-[#35858E]"
                        />
                        <span className="text-sm text-gray-700">In stock only</span>
                    </label>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <FiAlertCircle />
                    <span>{fetchError}</span>
                </div>
            )}

            {visible.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                        <FiShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold">No products match your filters.</p>
                    <p className="text-sm mt-1">Try clearing the search or picking another category.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setCategory('all');
                            setSort('newest');
                            setInStockOnly(false);
                        }}
                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#35858E] hover:underline"
                    >
                        Reset filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visible.map((product) => {
                        const out = Number(product.quantity || 0) <= 0;
                        const inWishlist = wishlistIds.has(String(product._id));
                        return (
                            <article
                                key={product._id}
                                className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
                            >
                                <Link href={`/products/${product._id}`} className="block">
                                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                                        <Image
                                            src={product.image || product.images?.[0]}
                                            alt={product.title || 'Product'}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {out && (
                                            <div className="absolute top-2 left-2">
                                                <Chip color="danger" size="sm" variant="solid" className="shadow-sm">
                                                    Sold out
                                                </Chip>
                                            </div>
                                        )}
                                        {product.category && (
                                            <div className="absolute top-2 right-2">
                                                <Chip
                                                    color="primary"
                                                    size="sm"
                                                    variant="flat"
                                                    className="capitalize shadow-sm"
                                                >
                                                    {product.category}
                                                </Chip>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <div>
                                        <Link
                                            href={`/products/${product._id}`}
                                            className="font-bold text-gray-900 hover:text-[#35858E] line-clamp-1"
                                        >
                                            {product.title || 'Untitled'}
                                        </Link>
                                        {product.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                        <p className="text-lg font-black text-[#35858E]">
                                            {currency(product.price)}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <WishlistButton
                                                productId={String(product._id)}
                                                userEmail={userEmail}
                                                initial={inWishlist}
                                                size="sm"
                                            />
                                            <Link
                                                href={`/products/${product._id}`}
                                                className="inline-flex items-center gap-1 text-sm font-semibold bg-[#35858E] hover:bg-[#2b6d75] text-white rounded-xl px-3 py-1.5 shadow-sm"
                                            >
                                                View <FiArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProductBrowser;