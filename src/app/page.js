import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import ProductCard from '@/components/ProductCard';
import { LuShieldCheck, LuTruck, LuHeart } from 'react-icons/lu';
import { FiArrowRight } from 'react-icons/fi';

async function safeFetchJson(url, options = {}) {
    try {
        const res = await fetch(url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error(`fetch ${url} failed:`, err);
        return null;
    }
}

export default async function HomePage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const userEmail = session?.user?.email || null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Pull approved products for the storefront
    const productsData = await safeFetchJson(`${apiUrl}/products`);
    const products = Array.isArray(productsData) ? productsData : productsData?.products || [];

    // Pull the user's wishlist (if logged in) so heart state is accurate
    let wishlistIds = new Set();
    if (userEmail) {
        const wishData = await safeFetchJson(`${apiUrl}/wishlist/${encodeURIComponent(userEmail)}`);
        const items = wishData?.items || [];
        wishlistIds = new Set(items.map((it) => String(it.productId)));
    }

    const featured = products.slice(0, 8);

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[#35858E]/5" />
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center gap-6">
                    <span className="inline-flex items-center gap-2 bg-white border border-[#35858E]/20 text-[#35858E] rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        <LuShieldCheck className="w-3.5 h-3.5" /> Trusted marketplace
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                        Curated finds, <span className="text-[#35858E]">delivered</span> with care.
                    </h1>
                    <p className="max-w-2xl text-base sm:text-lg text-gray-600">
                        Royalty brings together sellers, deliverymen, and shoppers in one streamlined
                        flow — discover products, place orders, and track them from approval to your
                        doorstep.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <Link
                            href="#products"
                            className="inline-flex items-center gap-2 bg-[#35858E] text-white font-semibold rounded-xl px-5 py-2.5 hover:bg-[#2b6d75] transition-colors shadow-lg shadow-[#35858E]/20"
                        >
                            Browse products <FiArrowRight className="w-4 h-4" />
                        </Link>
                        {!userEmail && (
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 font-semibold rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                Create an account
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Feature strip */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: LuShieldCheck, title: 'Approved sellers', body: 'Every product is reviewed by an admin before it goes live.' },
                        { icon: LuTruck, title: 'Tracked delivery', body: 'Sellers approve, deliverymen deliver — full transparency.' },
                        { icon: LuHeart, title: 'Save favorites', body: 'Build a wishlist and pick up where you left off.' },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm"
                        >
                            <div className="w-11 h-11 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center flex-shrink-0">
                                <f.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{f.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{f.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Products */}
            <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                            Featured products
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Approved by our team — ready to order.
                        </p>
                    </div>
                    {products.length > 8 && (
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-1 text-[#35858E] font-semibold hover:underline"
                        >
                            View all <FiArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {featured.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                        <p className="text-lg font-semibold">No products available yet.</p>
                        <p className="text-sm mt-1">
                            Once sellers list products and an admin approves them, they appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.map((p) => (
                            <ProductCard
                                key={p._id}
                                product={p}
                                userEmail={userEmail}
                                inWishlist={wishlistIds.has(String(p._id))}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
