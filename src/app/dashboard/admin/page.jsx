import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Chip } from '@heroui/react';
import { FiAlertCircle } from 'react-icons/fi';
import { LuShieldAlert, LuUsers, LuPackage, LuShoppingBag, LuArrowRight } from 'react-icons/lu';

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

export default async function AdminDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;
    if (!user) redirect('/login');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const [usersData, productsData, transactionsData] = await Promise.all([
        safeFetchJson(`${apiUrl}/users`),
        safeFetchJson(`${apiUrl}/admin/products`),
        safeFetchJson(`${apiUrl}/admin/transactions`),
    ]);

    const users = Array.isArray(usersData) ? usersData : [];
    const products = Array.isArray(productsData?.products) ? productsData.products : [];
    const transactions = Array.isArray(transactionsData?.transactions) ? transactionsData.transactions : [];

    const usersByRole = users.reduce((acc, u) => {
        const r = u.role || 'user';
        acc[r] = (acc[r] || 0) + 1;
        return acc;
    }, {});

    const blockedUsers = users.filter((u) => u.block).length;
    const pendingProducts = products.filter((p) => p.status === 'pending').length;
    const approvedProducts = products.filter((p) => p.status === 'approved').length;

    const revenue = transactions
        .filter((t) => t.paymentStatus === 'paid')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const pendingOrders = transactions.filter((t) => !t.sellerStatus || t.sellerStatus === 'pending').length;
    const deliveredOrders = transactions.filter((t) => t.sellerStatus === 'delivered').length;
    const cancelledOrders = transactions.filter((t) => t.sellerStatus === 'cancelled').length;

    const recentTransactions = transactions.slice(-5).reverse();

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center">
                    <LuShieldAlert className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin overview</h1>
                    <p className="text-gray-600 mt-1">
                        Platform health, user management, and order pipeline at a glance.
                    </p>
                </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatTile
                    icon={<LuUsers className="w-6 h-6" />}
                    label="Users"
                    value={users.length}
                    sub={`${blockedUsers} blocked`}
                    accent="bg-indigo-100 text-indigo-600"
                />
                <StatTile
                    icon={<LuPackage className="w-6 h-6" />}
                    label="Approved products"
                    value={approvedProducts}
                    sub={`${pendingProducts} pending review`}
                    accent="bg-emerald-100 text-emerald-600"
                />
                <StatTile
                    icon={<LuShoppingBag className="w-6 h-6" />}
                    label="Orders"
                    value={transactions.length}
                    sub={`${deliveredOrders} delivered · ${cancelledOrders} cancelled`}
                    accent="bg-amber-100 text-amber-600"
                />
                <StatTile
                    icon={<span className="text-xl font-black">$</span>}
                    label="Gross revenue"
                    value={currency(revenue)}
                    sub={`${pendingOrders} awaiting seller approval`}
                    accent="bg-[#35858E]/10 text-[#35858E]"
                />
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Link
                    href="/dashboard/admin/manage-users"
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-3 hover:shadow-md hover:border-[#35858E]/30 transition-all"
                >
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">People</p>
                        <p className="text-xl font-black text-gray-900 mt-1">Manage users</p>
                        <p className="text-sm text-gray-500 mt-1">Promote roles, block abusers.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <LuUsers className="w-6 h-6" />
                    </div>
                </Link>
                <Link
                    href="/dashboard/admin/manage-orders"
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-3 hover:shadow-md hover:border-[#35858E]/30 transition-all"
                >
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Catalog</p>
                        <p className="text-xl font-black text-gray-900 mt-1">Manage products</p>
                        <p className="text-sm text-gray-500 mt-1">Approve listings, remove violations.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <LuPackage className="w-6 h-6" />
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role distribution */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Users by role</h2>
                    <ul className="space-y-2">
                        {['user', 'seller', 'admin', 'deliveryman'].map((role) => (
                            <li
                                key={role}
                                className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"
                            >
                                <span className="capitalize text-sm font-semibold text-slate-700">{role}</span>
                                <Chip size="sm" variant="flat" color="primary">
                                    {usersByRole[role] || 0}
                                </Chip>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Recent transactions */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent transactions</h2>
                        <Link
                            href="/dashboard/admin/manage-orders"
                            className="text-sm font-semibold text-[#35858E] hover:underline inline-flex items-center gap-1"
                        >
                            View all <LuArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <p className="font-semibold">No transactions yet.</p>
                            <p className="text-sm mt-1">They'll appear here as customers check out.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recentTransactions.map((t) => (
                                <li
                                    key={t.transactionId}
                                    className="py-3 flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {t.productTitle || 'Product'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {t.customerEmail} · {currency(t.amount)} {t.currency?.toUpperCase()}
                                        </p>
                                    </div>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={
                                            t.sellerStatus === 'delivered'
                                                ? 'success'
                                                : t.sellerStatus === 'cancelled'
                                                    ? 'danger'
                                                    : t.sellerStatus === 'approved'
                                                        ? 'primary'
                                                        : 'warning'
                                        }
                                        className="capitalize"
                                    >
                                        {t.sellerStatus || 'pending'}
                                    </Chip>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {(!usersData || !productsData || !transactionsData) && (
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