import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { 
    FiAlertCircle, 
    FiDollarSign, 
    FiPieChart, 
    FiClock, 
    FiCheckCircle,
    FiXCircle,
    FiChevronLeft,
    FiChevronRight
} from 'react-icons/fi';
import { Button } from '@heroui/react';
import CancelButton from '@/components/CancelButton';

export default async function TransactionPage({ searchParams }) {
    // Next.js 15+ এর জন্য searchParams প্রোমিজ আকারে আসে, তাই await করে নেওয়া নিরাপদ
    const resolvedSearchParams = await searchParams;
    const currentPage = Number(resolvedSearchParams?.page) || 1;
    const rowsPerPage = 5;

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

    // ৪. সার্ভার সাইড পেজিনেশন স্লাইস
    const totalPages = Math.ceil(totalTransactions / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + rowsPerPage);

    

    return (
        <div className="min-h-screen bg-slate-50/40 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Title */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
                    <div>
                        <div className="flex items-center gap-2.5 text-xs font-bold text-[#35858E] tracking-wider uppercase mb-1">
                             Secure Financial Ledger
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
                            Transaction History
                        </h1>
                        <p className="text-slate-500 mt-1.5 text-sm sm:text-base">
                            Review detailed execution logs, tracking summaries, and live status states.
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Traded Volume</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tight block">${totalVolume.toLocaleString()}</span>
                                </div>
                                <div className="w-12 h-12 bg-[#35858E]/10 rounded-xl flex items-center justify-center text-[#35858E]">
                                    <FiDollarSign className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Settled Operations</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tight block">{totalTransactions} <span className="text-xs font-medium text-slate-400">Records</span></span>
                                </div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <FiPieChart className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Escrows</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tight block">{pendingRequests} <span className="text-xs font-medium text-slate-400">Awaiting</span></span>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <FiClock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Pure Tailwind & DaisyUI Responsive Table (Zero Collection Errors) */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full text-slate-700">
                                    <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase border-b border-slate-200">
                                        <tr>
                                            <th className="py-4 pl-6">Transaction ID</th>
                                            <th>Product Name</th>
                                            <th>Amount</th>
                                            <th>Payment Status</th>
                                            <th>Order Status</th>
                                            <th className="text-right pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedTransactions.map((tx) => {
                                            const txId = tx._id?.$oid || tx._id;
                                            const isPending = tx.sellerStatus === 'pending';
                                            
                                            return (
                                                <tr key={txId} className="hover:bg-slate-50/50 transition-colors">
                                                    {/* Tx ID */}
                                                    <td className="font-mono text-xs text-slate-500 py-4 pl-6 max-w-[150px] truncate" title={tx.transactionId}>
                                                        {tx.transactionId}
                                                    </td>

                                                    {/* Title */}
                                                    <td className="font-semibold text-slate-900 max-w-[200px] truncate">
                                                        {tx.productTitle}
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="font-bold text-slate-900">
                                                        <span className="text-xs uppercase font-medium text-slate-400 mr-0.5">{tx.currency}</span>
                                                        {tx.amount}
                                                    </td>

                                                    {/* Payment Status */}
                                                    <td>
                                                        <div className={`badge gap-1.5 px-3 py-2.5 font-semibold text-xs border-none rounded-full capitalize
                                                            ${tx.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                                                        >
                                                            <FiCheckCircle className="w-3.5 h-3.5" />
                                                            {tx.paymentStatus}
                                                        </div>
                                                    </td>

                                                    {/* Seller Status */}
                                                    <td>
                                                        <div className={`badge gap-1.5 px-3 py-2.5 font-semibold text-xs border-none rounded-full capitalize
                                                            ${tx.sellerStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                              tx.sellerStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                                                              'bg-red-100 text-red-700'}`}
                                                        >
                                                            {tx.sellerStatus === 'pending' && <FiClock className="w-3.5 h-3.5 animate-pulse" />}
                                                            {tx.sellerStatus === 'approved' && <FiCheckCircle className="w-3.5 h-3.5" />}
                                                            {tx.sellerStatus === 'cancelled' && <FiXCircle className="w-3.5 h-3.5" />}
                                                            {tx.sellerStatus}
                                                        </div>
                                                    </td>

                                                    {/* Server Action Form Trigger */}
                                                    <td className="text-right pr-6">
                                                        {isPending ? (
                                                            <CancelButton transactionId={tx?.transactionId}></CancelButton>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium select-none">No actions</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Server-Side URL Driven Pagination */}
                            <div className="flex items-center justify-between bg-slate-50/50 px-6 py-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500">
                                    Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(startIndex + rowsPerPage, totalTransactions)}</span> of <span className="font-semibold text-slate-700">{totalTransactions}</span> results
                                </p>
                                
                              <div className="flex items-center gap-3">
                                {/* Previous Button */}
                                {currentPage > 1 ? (
                                    <Link
                                    href={`?page=${currentPage - 1}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-slate-700 font-semibold"
                                    >
                                    <FiChevronLeft className="text-lg" />
                                    Prev
                                    </Link>
                                ) : (
                                    <button
                                    disabled
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed font-semibold"
                                    >
                                    <FiChevronLeft className="text-lg" />
                                    Prev
                                    </button>
                                )}

                                {/* Page Indicator */}
                                <div className="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700">
                                    {currentPage} / {totalPages}
                                </div>

                                {/* Next Button */}
                                {currentPage < totalPages ? (
                                    <Link
                                    href={`?page=${currentPage + 1}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:shadow-md transition-all duration-200 text-slate-700 font-semibold"
                                    >
                                    Next
                                    <FiChevronRight className="text-lg" />
                                    </Link>
                                ) : (
                                    <button
                                    disabled
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed font-semibold"
                                    >
                                    Next
                                    <FiChevronRight className="text-lg" />
                                    </button>
                                )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}