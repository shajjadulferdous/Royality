import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Chip } from '@heroui/react';
import { FiAlertCircle, FiBox, FiDollarSign, FiPackage } from 'react-icons/fi';
import {
    LuLayoutDashboard,
    LuPackage,
    LuShoppingBag,
    LuCalendarClock,
} from 'react-icons/lu';

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

export default async function SellerDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;
    if (!user) redirect('/login');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const [productsData, ordersData] = await Promise.all([
        safeFetchJson(`${apiUrl}/my-products?email=${encodeURIComponent(user.email)}`),
        safeFetchJson(`${apiUrl}/seller/orders/${encodeURIComponent(user.email)}`),
    ]);

    const products = Array.isArray(productsData?.products) ? productsData.products : [];
    const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || [];

    const pendingOrders = orders.filter((o) => !o.sellerStatus || o.sellerStatus === 'pending');
    const approvedOrders = orders.filter((o) => o.sellerStatus === 'approved');
    const deliveredOrders = orders.filter((o) => o.sellerStatus === 'delivered');
    const cancelledOrders = orders.filter((o) => o.sellerStatus === 'cancelled');

    const totalRevenue = orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    const recentProducts = products.slice(0, 4);
    const recentOrders = orders.slice(0, 4);

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center">
                    <LuLayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user.name?.split(' ')[0] || 'Seller'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your catalog, approve orders, and watch revenue roll in.
                    </p>
                </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatTile
                    icon={<LuPackage className="w-6 h-6" />}
                    label="Listed products"
                    value={products.length}
                    accent="bg-[#35858E]/10 text-[#35858E]"
                />
                <StatTile
                    icon={<FiBox className="w-6 h-6" />}
                    label="Pending orders"
                    value={pendingOrders.length}
                    accent="bg-amber-100 text-amber-600"
                />
                <StatTile
                    icon={<LuShoppingBag className="w-6 h-6" />}
                    label="Delivered"
                    value={deliveredOrders.length}
                    accent="bg-emerald-100 text-emerald-600"
                />
                <StatTile
                    icon={<FiDollarSign className="w-6 h-6" />}
                    label="Revenue (paid)"
                    value={currency(totalRevenue)}
                    accent="bg-indigo-100 text-indigo-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent products */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <LuPackage className="text-[#35858E]" /> Recent products
                        </h2>
                        <Link
                            href="/dashboard/seller/my-added-product"
                            className="text-sm font-semibold text-[#35858E] hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {recentProducts.length === 0 ? (
                        <EmptyState
                            icon={<FiPackage className="w-6 h-6" />}
                            title="No products yet"
                            subtitle="List your first item to start selling."
                            cta={
                                <Link
                                    href="/dashboard/seller/add-product"
                                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#35858E] hover:underline"
                                >
                                     Add a product
                                </Link>
                            }
                        />
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recentProducts.map((p) => (
                                <li key={p._id} className="py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{p.title || 'Untitled'}</p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {p.category || 'Uncategorized'} · stock {p.quantity ?? '—'}
                                        </p>
                                    </div>
                                    <Chip
                                        color={p.status === 'approved' ? 'success' : 'warning'}
                                        variant="flat"
                                        size="sm"
                                        className="capitalize"
                                    >
                                        {p.status || 'pending'}
                                    </Chip>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Recent bookings */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <LuCalendarClock className="text-[#35858E]" /> Recent bookings
                        </h2>
                        <Link
                            href="/dashboard/seller/requested-bookings"
                            className="text-sm font-semibold text-[#35858E] hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <EmptyState
                            icon={<FiBox className="w-6 h-6" />}
                            title="No orders yet"
                            subtitle="Bookings will show up here as customers buy your products."
                        />
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recentOrders.map((o) => (
                                <li
                                    key={o.transactionId}
                                    className="py-3 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {o.productTitle || 'Product'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {o.customerEmail} · {currency(o.amount)} {o.currency?.toUpperCase()}
                                        </p>
                                    </div>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                            o.sellerStatus === 'approved'
                                                ? 'primary'
                                                : o.sellerStatus === 'delivered'
                                                    ? 'success'
                                                    : o.sellerStatus === 'cancelled'
                                                        ? 'danger'
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
            </div>

            {/* Quick links / breakdown */}
            <section className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Order breakdown</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <Breakdown label="Pending" value={pendingOrders.length} />
                    <Breakdown label="Approved" value={approvedOrders.length} />
                    <Breakdown label="Delivered" value={deliveredOrders.length} />
                    <Breakdown label="Cancelled" value={cancelledOrders.length} />
                </div>
            </section>

            {(!productsData || !ordersData) && (
                <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                    <FiAlertCircle />
                    <span>Some seller data failed to load. Pull-to-refresh to retry.</span>
                </div>
            )}
        </div>
    );
}

function StatTile({ icon, label, value, accent }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${accent}`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

function Breakdown({ label, value }) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
            <p className="text-xl font-black text-slate-900 mt-1">{value}</p>
        </div>
    );
}

function EmptyState({ icon, title, subtitle, cta }) {
    return (
        <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                {icon}
            </div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm mt-1">{subtitle}</p>
            {cta && <div className="mt-3">{cta}</div>}
        </div>
    );
}