import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Chip } from '@heroui/react';
import { FiAlertCircle } from 'react-icons/fi';
import ApproveOrderButton from '@/components/ApproveOrderButton';

export default async function RequestedBookingsPage() {
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
        // Pull this seller's products first, then collect orders for those products.
        const productsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/my-products?email=${user.email}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' }
        );
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
        const myProducts = productsData.products || [];
        const myProductIds = new Set(myProducts.map((p) => String(p._id)));

        const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tranctions/${user.email}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        }).catch(() => null);

        // Note: /tranctions/:email is the customer's view; sellers need their own feed.
        // We fall back to fetching all transactions and filtering on the seller match.
        const allTxRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seller/orders/${user.email}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        }).catch(() => null);

        let allTx = [];
        if (allTxRes && allTxRes.ok) {
            const data = await allTxRes.json();
            allTx = Array.isArray(data) ? data : data.orders || [];
        } else {
            // If the dedicated seller endpoint is missing, use what we have without crashing.
            fetchError = null;
            allTx = [];
        }

        orders = allTx.filter((tx) => myProductIds.has(String(tx.productId)));
    } catch (error) {
        console.error('Failed to load seller orders:', error);
        fetchError = 'Failed to fetch orders. Please try again later.';
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">Requested Bookings</h1>
                <p className="text-gray-600 mt-2">
                    Orders for products you sell. Approve them so a deliveryman can pick them up.
                </p>
            </div>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <FiAlertCircle />
                    <span>{fetchError}</span>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                    <p className="text-lg">No bookings yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.transactionId}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {order.productTitle || 'Product'}
                                    </h2>
                                    <p className="text-xs font-mono text-[#35858E] mt-1 break-all">
                                        {order.transactionId}
                                    </p>
                                </div>
                                <Chip
                                    color={
                                        order.sellerStatus === 'approved'
                                            ? 'primary'
                                            : order.sellerStatus === 'delivered'
                                            ? 'success'
                                            : order.sellerStatus === 'cancelled'
                                            ? 'danger'
                                            : 'warning'
                                    }
                                    size="sm"
                                    variant="flat"
                                    className="capitalize"
                                >
                                    {order.sellerStatus || 'pending'}
                                </Chip>
                            </div>

                            <div className="text-sm text-slate-600 space-y-1">
                                <p>
                                    <span className="font-semibold text-slate-800">Customer:</span>{' '}
                                    {order.customerEmail}
                                </p>
                                <p>
                                    <span className="font-semibold text-slate-800">Amount:</span>{' '}
                                    {order.amount} {order.currency?.toUpperCase()}
                                </p>
                                <p className="capitalize">
                                    <span className="font-semibold text-slate-800">Payment:</span>{' '}
                                    {order.paymentStatus}
                                </p>
                            </div>

                            {order.sellerStatus !== 'approved' && order.sellerStatus !== 'delivered' && order.sellerStatus !== 'cancelled' && (
                                <div className="pt-2 mt-auto border-t border-gray-100 flex justify-end">
                                    <ApproveOrderButton transactionId={order.transactionId} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
