import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Chip, Table } from "@heroui/react";
import {
    FiAlertCircle,
    FiPieChart,
} from 'react-icons/fi';

export default async function TransactionPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const currentPage = Number(resolvedSearchParams?.page) || 1;
    const rowsPerPage = 8;

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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tranctions/${user?.email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
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
                        <p className="text-sm text-red-600/90 mt-0.5">
                            Failed to fetch transactions dataset. Please verify system endpoints.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const rawTransactions = await response.json();
    const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];

    const totalTransactions = transactions.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
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
                    <Table>
                        <Table.ResizableContainer>
                            <Table.Content aria-label="Transactions table" className="min-w-[1200px]">
                                <Table.Header>
                                    <Table.Column isRowHeader defaultWidth="3fr" id="txId" minWidth={180}>
                                        Transaction ID
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="1.5fr" id="productTitle" minWidth={160}>
                                        Product Title
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="1fr" id="amount" minWidth={100}>
                                        Amount
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="0.8fr" id="currency" minWidth={80}>
                                        Currency
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="1fr" id="status" minWidth={120}>
                                        Payment Status
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="1fr" id="sellerStatus" minWidth={120}>
                                        Seller Status
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="1.5fr" id="email" minWidth={180}>
                                        Customer Email
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="1.5fr" id="phone" minWidth={140}>
                                        Phone
                                        <Table.ColumnResizer />
                                    </Table.Column>
                                    <Table.Column defaultWidth="2fr" id="address" minWidth={220}>
                                        Address
                                    </Table.Column>
                                </Table.Header>
                                
                                <Table.Body>
                                    {paginatedTransactions.map((tx) => (
                                        <Table.Row key={tx._id?.$oid || tx.transactionId}>
                                            {/* 1. Transaction ID */}
                                            <Table.Cell className="font-mono text-xs text-[#35858E] font-semibold">
                                                {tx.transactionId}
                                            </Table.Cell>
                                            
                                            {/* 2. Product Title */}
                                            <Table.Cell className="font-medium text-slate-900">
                                                {tx.productTitle || "N/A"}
                                            </Table.Cell>
                                            
                                            {/* 3. Amount */}
                                            <Table.Cell className="font-semibold text-slate-800">
                                                {tx.amount}
                                            </Table.Cell>

                                            {/* 4. Currency */}
                                            <Table.Cell className="font-bold text-slate-600 uppercase text-xs">
                                                {tx.currency}
                                            </Table.Cell>
                                            
                                            {/* 5. Payment Status */}
                                            <Table.Cell>
                                                <Chip 
                                                    color={tx.paymentStatus === 'paid' ? 'success' : 'warning'} 
                                                    size="sm" 
                                                    variant="soft"
                                                    className="capitalize font-medium"
                                                >
                                                    {tx.paymentStatus}
                                                </Chip>
                                            </Table.Cell>

                                            {/* 6. Seller Status */}
                                            <Table.Cell>
                                                <Chip 
                                                    color={tx.sellerStatus === 'completed' ? 'success' : tx.sellerStatus === 'pending' ? 'warning' : 'danger'} 
                                                    size="sm" 
                                                    variant="flat"
                                                    className="capitalize font-medium"
                                                >
                                                    {tx.sellerStatus || "N/A"}
                                                </Chip>
                                            </Table.Cell>
                                            
                                            {/* 7. Customer Email */}
                                            <Table.Cell className="text-slate-600 text-sm">
                                                {tx.customerEmail}
                                            </Table.Cell>

                                            {/* 8. Phone */}
                                            <Table.Cell className="text-slate-600 text-sm font-mono">
                                                {tx.phone || "N/A"}
                                            </Table.Cell>

                                            {/* 9. Address */}
                                            <Table.Cell className="text-slate-500 text-xs max-w-[200px] truncate" title={tx.address}>
                                                {tx.address || "N/A"}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Content>
                        </Table.ResizableContainer> {/* Fix for Table.ResizableContainer structure matching standard HeroUI */}
                    </Table>
                )}
            </div>
        </div>
    );
}