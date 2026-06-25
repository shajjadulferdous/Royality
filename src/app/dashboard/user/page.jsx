import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Chip } from '@heroui/react';
import { FiAlertCircle, FiArrowRight, FiDollarSign, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { LuLayoutDashboard } from 'react-icons/lu';

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

const currency = (n) =>
    `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function UserDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;
    if (!user) redirect('/login');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const [ordersData, wishlistData] = await Promise.all([
        safeFetchJson(`${apiUrl}/tranctions/${encodeURIComponent(user.email)}`),
        safeFetchJson(`${apiUrl}/wishlist/${encodeURIComponent(user.email)}`),
    ]);

    const orders = Array.isArray(ordersData) ? ordersData : [];
    const wishlist = Array.isArray(wishlistData?.items) ? wishlistData.items : [];

    const totalSpent = orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    const delivered = orders.filter((o) => o.sellerStatus === 'delivered').length;
    const inProgress = orders.filter((o) =>
        ['approved', 'pending'].includes(o.sellerStatus) || !o.sellerStatus
    ).length;
    const cancelled = orders.filter((o) => o.sellerStatus === 'cancelled').length;

    const recent = orders.slice(-5).reverse();

    const role = user.role || 'user';

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Profile card */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                <div className="h-24 sm:h-32 bg-gradient-to-r from-[#35858E] to-[#4ab3be]" />
                <div className="px-6 pb-6 -mt-12 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white bg-white shadow-md flex-shrink-0">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || 'Profile'}
                                width={112}
                                height={112}
                                unoptimized
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#35858E]/10 text-[#35858E] text-3xl font-black">
                                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                            {user.name || 'Welcome'}
                        </h1>
                        <p className="text-gray-500 truncate">{user.email}</p>
                        <div className="mt-2">
                            <Chip color="primary" variant="flat" size="sm" className="capitalize">
                                <LuLayoutDashboard className="w-3.5 h-3.5 mr-1" /> {role}
                            </Chip>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/my-profile"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 rounded-xl px-4 py-2"
                        >
                            My profile <FiArrowRight className="w-4 h-4" />
                        </Link>
                        {role === 'user' && (
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-[#35858E] hover:bg-[#2b6d75] text-white rounded-xl px-4 py-2 shadow-sm"
                            >
                                Shop now <FiArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatTile
                    icon={<FiShoppingBag className="w-6 h-6" />}
                    label="Total orders"
                    value={orders.length}
                    accent="bg-indigo-100 text-indigo-600"
                />
                <StatTile
                    icon={<FiDollarSign className="w-6 h-6" />}
                    label="Total spent"
                    value={currency(totalSpent)}
                    accent="bg-emerald-100 text-emerald-600"
                />
                <StatTile
                    icon={<FiHeart className="w-6 h-6" />}
                    label="Wishlist"
                    value={wishlist.length}
                    accent="bg-pink-100 text-pink-600"
                />
                <StatTile
                    icon={<LuLayoutDashboard className="w-6 h-6" />}
                    label="In progress"
                    value={inProgress}
                    sub={`${delivered} delivered · ${cancelled} cancelled`}
                    accent="bg-amber-100 text-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent orders */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent orders</h2>
                        <Link
                            href="/dashboard/user/my-orders"
                            className="text-sm font-semibold text-[#35858E] hover:underline inline-flex items-center gap-1"
                        >
                            View all <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p className="font-semibold">No orders yet.</p>
                            <p className="text-sm mt-1">Browse the catalog and grab your first item.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recent.map((o) => (
                                <li
                                    key={o.transactionId}
                                    className="py-3 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {o.productTitle || 'Product'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {currency(o.amount)} {o.currency?.toUpperCase()} · {o.paymentStatus}
                                        </p>
                                    </div>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                            o.sellerStatus === 'delivered'
                                                ? 'success'
                                                : o.sellerStatus === 'cancelled'
                                                    ? 'danger'
                                                    : o.sellerStatus === 'approved'
                                                        ? 'primary'
                                                        : 'warning'
                                        }
                                        className="capitalize"
                                    >
                                        {o.sellerStatus || 'pending'}
                                    </Chip>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Wishlist shortcut */}
                <section className="bg-gradient-to-br from-[#35858E] to-[#2b6d75] text-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center">
                            <FiHeart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Your wishlist</p>
                            <p className="text-2xl font-black">
                                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm opacity-90">
                        Items you save are stored here so you can pick up where you left off.
                    </p>
                    <Link
                        href="/dashboard/user/my-wishlist"
                        className="inline-flex items-center gap-1.5 bg-white text-[#35858E] font-semibold rounded-xl px-4 py-2 self-start hover:bg-white/95"
                    >
                        Open wishlist <FiArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>

            {(!ordersData || !wishlistData) && (
                <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                    <FiAlertCircle />
                    <span>Some dashboard data failed to load. Refresh to retry.</span>
                </div>
            )}
        </div>
    );
}

function StatTile({ icon, label, value, sub, accent }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${accent}`}>{icon}</div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mt-3">{label}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5 break-words">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}