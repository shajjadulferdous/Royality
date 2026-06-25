import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
    FiAlertCircle,
    FiDollarSign,
    FiPieChart,
    FiClock,
    FiCheckCircle,
    FiPackage,
    FiCreditCard,
} from 'react-icons/fi';
import TransactionsTable from './TransactionsTable';

export default async function TransactionPage({ searchParams }) {
    // Next.js 15+ এর জন্য searchParams প্রোমিজ আকারে আসে, তাই await করে নেওয়া নিরাপদ
    const resolvedSearchParams = await searchParams;
    const currentPage = Number(resolvedSearchParams?.page) || 1;
    const rowsPerPage = 8;

    // ১. ইউজার সেশন চেক
    const session = await auth.api.getSession({
        headers: await headers()
    });
    const user = session?.user;

    if (!user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                        <FiAlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Authentication Required</h2>
                    <p className="text-slate-500 mb-6">Please sign in to view your transaction history.</p>
                </div>
            </div>
        );
    }

    // ২. সার্ভার সাইড ডাটা ফেচিং
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tranctions/${user?.email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 my-10">
                <div className="bg-red-50/60 border border-red-100 text-red-700 px-6 py-5 rounded-2xl flex items-center gap-4 shadow-sm">
                    <FiAlertCircle className="w-6 h-6 flex-shrink-0 text-red-500" />
                    <div>
                        <h3 className="font-bold text-lg">Sync Interface Interrupted</h3>
                        <p className="text-sm text-red-600/90 mt-0.5">Failed to fetch transactions dataset. Please verify system endpoints.</p>
                    </div>
                </div>
            </div>
        );
    }

    const rawTransactions = await response.json();
    const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];

    // ৩. ড্যাশবোর্ড অ্যানালিটিক্স হিসাব (Server-side reduction)
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => tx.paymentStatus === 'paid' ? sum + Number(tx.amount || 0) : sum, 0);
    const pendingRequests = transactions.filter(tx => tx.sellerStatus === 'pending').length;
    const completedOrders = transactions.filter(tx => tx.sellerStatus === 'approved' || tx.sellerStatus === 'delivered').length;

    // ৪. সার্ভার সাইড পেজিনেশন স্লাইস
    const totalPages = Math.ceil(totalTransactions / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Title */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#35858E] tracking-wider uppercase mb-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#35858E]" />
                            Secure Financial Ledger
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
                            Transaction History
                        </h1>
                        <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-xl">
                            Review detailed execution logs, tracking summaries, and live status states for every order.
                        </p>
                    </div>
                </div>

                {totalTransactions === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xl max-w-2xl mx-auto my-12">
                        <div className="w-20 h-20 mx-auto bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-5 shadow-inner">
                            <FiPieChart className="w-9 h-9" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No transactions recorded</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                            Any checkouts or platform purchases you authorize will generate live statements instantly right here.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Premium Dashboard Metrics Panel */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="group bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-300">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight block">
                                        ${totalVolume.toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-11 h-11 bg-[#35858E]/10 rounded-xl flex items-center justify-center text-[#35858E] group-hover:scale-105 transition-transform">
                                    <FiDollarSign className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="group bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-300">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Records</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight block">
                                        {totalTransactions}
                                    </span>
                                </div>
                                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                                    <FiPackage className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="group bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-300">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight block">
                                        {pendingRequests}
                                    </span>
                                </div>
                                <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                                    <FiClock className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="group bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-slate-300">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight block">
                                        {completedOrders}
                                    </span>
                                </div>
                                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                                    <FiCheckCircle className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#35858E]/10 flex items-center justify-center text-[#35858E]">
                                    <FiCreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">All Transactions</h2>
                                    <p className="text-xs text-slate-500">Sorted by most recent</p>
                                </div>
                            </div>
                            <span className="hidden sm:inline-block px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600">
                                {totalTransactions} entries
                            </span>
                        </div>

                        {/* HeroUI Table */}
                        <TransactionsTable
                            rows={paginatedTransactions}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            startIndex={startIndex}
                            rowsPerPage={rowsPerPage}
                            totalTransactions={totalTransactions}
                        />
                    </>
                )}
            </div>
        </div>
    );
}