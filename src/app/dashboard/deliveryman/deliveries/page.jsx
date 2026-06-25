import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Chip } from '@heroui/react';
import { FiAlertCircle, FiMapPin, FiPhone, FiTruck } from 'react-icons/fi';
import { LuPackage } from 'react-icons/lu';
import DeliverButton from '@/components/DeliverButton';

export default async function DeliveriesPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    if (!user) {
        redirect('/login');
    }

    let orders = [];
    let fetchError = null;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery/orders`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) {
            fetchError = 'Failed to fetch delivery orders. Please try again later.';
        } else {
            const data = await res.json();
            orders = Array.isArray(data.orders) ? data.orders : [];
        }
    } catch (error) {
        console.error('Failed to load deliveries:', error);
        fetchError = 'Failed to fetch delivery orders. Please try again later.';
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center">
                    <FiTruck className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Approved Deliveries</h1>
                    <p className="text-gray-600 mt-1">
                        Orders approved by sellers that are waiting to be delivered.
                    </p>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <FiAlertCircle />
                    <span>{fetchError}</span>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                        <LuPackage className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold">No approved deliveries right now.</p>
                    <p className="text-sm mt-1">
                        New orders will appear here as soon as a seller marks them as approved.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.transactionId}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                                        {order.productTitle || 'Untitled product'}
                                    </h2>
                                    <p className="text-xs font-mono text-[#35858E] mt-1 break-all">
                                        {order.transactionId}
                                    </p>
                                </div>
                                <Chip color="primary" variant="flat" size="sm" className="capitalize">
                                    {order.sellerStatus}
                                </Chip>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                        Amount
                                    </p>
                                    <p className="text-lg font-black text-slate-900 mt-1">
                                        {order.amount} {order.currency?.toUpperCase()}
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

                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-600 space-y-2">
                                <p className="font-semibold text-slate-800">Customer</p>
                                <p className="break-all">{order.customerEmail}</p>
                                {order.phone && (
                                    <p className="flex items-center gap-2">
                                        <FiPhone className="text-[#35858E]" /> {order.phone}
                                    </p>
                                )}
                                {order.address && (
                                    <p className="flex items-start gap-2">
                                        <FiMapPin className="text-[#35858E] mt-0.5" />
                                        <span>{order.address}</span>
                                    </p>
                                )}
                            </div>

                            <div className="pt-2 mt-auto border-t border-gray-100 flex justify-end">
                                <DeliverButton transactionId={order.transactionId} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
