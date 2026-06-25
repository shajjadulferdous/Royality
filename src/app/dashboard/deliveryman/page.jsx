import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LuTruck, LuPackage } from 'react-icons/lu';
import { FiCheckCircle } from 'react-icons/fi';

export default async function DeliverymanHomePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    if (!user) {
        redirect('/login');
    }

    let approvedCount = 0;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delivery/orders`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (res.ok) {
            const data = await res.json();
            approvedCount = data.orders?.length || 0;
        }
    } catch (error) {
        console.error('Failed to load delivery count:', error);
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome, {user.name}
                </h1>
                <p className="text-gray-600 mt-2">
                    Deliveryman dashboard — pick up approved orders and mark them as delivered.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center">
                        <LuPackage className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Approved orders waiting</p>
                        <p className="text-3xl font-black text-gray-900">{approvedCount}</p>
                    </div>
                </div>

                <Link
                    href="/dashboard/deliveryman/deliveries"
                    className="bg-[#35858E] text-white rounded-2xl shadow-sm p-6 flex items-center gap-4 hover:bg-[#2b6d75] transition-colors"
                >
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <LuTruck className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm opacity-90">Go to</p>
                        <p className="text-2xl font-black">Manage Deliveries</p>
                    </div>
                </Link>
            </div>

            <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FiCheckCircle className="text-green-500" /> How it works
                </h2>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>The seller approves a paid order; its <code>sellerStatus</code> becomes <strong>approved</strong>.</li>
                    <li>You see those orders on the <strong>Deliveries</strong> page.</li>
                    <li>Hand the package to the customer, then click <strong>Mark as Delivered</strong>.</li>
                    <li>The order is moved to <code>delivered</code> and disappears from your active queue.</li>
                </ul>
            </div>
        </div>
    );
}
