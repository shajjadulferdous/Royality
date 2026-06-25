import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Chip } from '@heroui/react';
import { FiAlertCircle, FiMapPin, FiPhone, FiShoppingBag } from 'react-icons/fi';
import { LuShoppingBag } from 'react-icons/lu';
import CancelButton from '@/components/CancelButton';

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

const statusChip = (status) => {
    if (status === 'delivered') return { color: 'success', label: 'Delivered' };
    if (status === 'cancelled') return { color: 'danger', label: 'Cancelled' };
    if (status === 'approved') return { color: 'primary', label: 'On the way' };
    return { color: 'warning', label: 'Pending' };
};

export default async function MyOrdersPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;
    if (!user) redirect('/login');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const data = await safeFetchJson(`${apiUrl}/tranctions/${encodeURIComponent(user.email)}`);
    const orders = Array.isArray(data) ? data : [];

    // Sort newest first
    const sorted = [...orders].sort((a, b) => {
        const ad = a._id ? new Date(a._id.getTimestamp?.() || 0).getTime() : 0;
        const bd = b._id ? new Date(b._id.getTimestamp?.() || 0).getTime() : 0;
        return bd - ad;
    });

    const counts = sorted.reduce((acc, o) => {
        const s = o.sellerStatus || 'pending';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center">
                    <LuShoppingBag className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">
                        Track everything you've purchased and where each order stands.
                    </p>
                </div>
            </div>

            {/* Summary chips */}
            {sorted.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <Chip color="warning" variant="flat" size="sm">
                        Pending: {counts.pending || 0}
                    </Chip>
                    <Chip color="primary" variant="flat" size="sm">
                        On the way: {counts.approved || 0}
                    </Chip>
                    <Chip color="success" variant="flat" size="sm">
                        Delivered: {counts.delivered || 0}
                    </Chip>
                    <Chip color="danger" variant="flat" size="sm">
                        Cancelled: {counts.cancelled || 0}
                    </Chip>
                </div>
            )}

            {sorted.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                        <FiShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold">No orders yet.</p>
                    <p className="text-sm mt-1">Your purchases will appear here.</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#35858E] hover:underline"
                    >
                        Start shopping →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sorted.map((order) => {
                        const chip = statusChip(order.sellerStatus);
                        const cancellable =
                            !order.sellerStatus ||
                            order.sellerStatus === 'pending' ||
                            order.sellerStatus === 'approved';
                        return (
                            <div
                                key={order.transactionId}
                                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-bold text-gray-900 truncate">
                                            {order.productTitle || 'Product'}
                                        </h2>
                                        <p className="text-xs font-mono text-[#35858E] mt-1 break-all">
                                            {order.transactionId}
                                        </p>
                                    </div>
                                    <Chip color={chip.color} variant="flat" size="sm">
                                        {chip.label}
                                    </Chip>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Amount
                                        </p>
                                        <p className="text-lg font-black text-slate-900 mt-1">
                                            {currency(order.amount)} {order.currency?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Payment
                                        </p>
                                        <p className="text-lg font-bold text-slate-900 mt-1 capitalize">
                                            {order.paymentStatus}
                                        </p>
                                    </div>
                                </div>

                                {(order.address || order.phone) && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-600 space-y-2">
                                        <p className="font-semibold text-slate-800">Delivery details</p>
                                        {order.address && (
                                            <p className="flex items-start gap-2">
                                                <FiMapPin className="text-[#35858E] mt-0.5 flex-shrink-0" />
                                                <span>{order.address}</span>
                                            </p>
                                        )}
                                        {order.phone && (
                                            <p className="flex items-center gap-2">
                                                <FiPhone className="text-[#35858E]" /> {order.phone}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {cancellable && (
                                    <div className="pt-2 mt-auto border-t border-gray-100 flex justify-end">
                                        <CancelButton transactionId={order.transactionId} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!data && (
                <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                    <FiAlertCircle />
                    <span>Couldn't load your orders. Refresh to retry.</span>
                </div>
            )}
        </div>
    );
}