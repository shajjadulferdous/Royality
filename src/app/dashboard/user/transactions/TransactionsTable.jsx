'use client';

import React from 'react';
import { Chip, Table } from '@heroui/react';
import {
    FiCreditCard,
    FiTruck,
    FiChevronLeft,
    FiChevronRight,
    FiCheckCircle,
    FiClock,
    FiXCircle,
} from 'react-icons/fi';
import Link from 'next/link';
import CancelButton from '@/components/CancelButton';

// Tone → HeroUI Chip color mapping
function paymentChipColor(status) {
    switch (status) {
        case 'paid':     return 'success';
        case 'unpaid':   return 'warning';
        case 'refunded': return 'primary';
        case 'failed':   return 'danger';
        default:         return 'default';
    }
}

function sellerChipColor(status) {
    switch (status) {
        case 'approved':  return 'success';
        case 'pending':   return 'warning';
        case 'cancelled': return 'danger';
        case 'shipped':   return 'primary';
        case 'delivered': return 'success';
        default:          return 'default';
    }
}

function sellerIcon(status) {
    switch (status) {
        case 'approved':
        case 'delivered':
            return <FiCheckCircle className="w-3.5 h-3.5" />;
        case 'cancelled':
            return <FiXCircle className="w-3.5 h-3.5" />;
        case 'pending':
        case 'shipped':
        default:
            return <FiClock className="w-3.5 h-3.5" />;
    }
}

export default function TransactionsTable({
    rows,
    currentPage,
    totalPages,
    startIndex,
    rowsPerPage,
    totalTransactions,
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table
                    aria-label="Transactions table"
                    classNames={{
                        wrapper: 'bg-transparent shadow-none p-0',
                        th: 'bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200',
                        td: 'text-sm text-slate-700 align-middle py-4',
                        tr: 'hover:bg-slate-50/60 transition-colors',
                    }}
                >
                    <Table.Header>
                        <Table.Column className="!pl-6">Transaction ID</Table.Column>
                        <Table.Column>Product</Table.Column>
                        <Table.Column>Amount</Table.Column>
                        <Table.Column>Payment</Table.Column>
                        <Table.Column>Order Status</Table.Column>
                        <Table.Column className="!pr-6 text-right">Actions</Table.Column>
                    </Table.Header>

                    <Table.Body emptyContent="No transactions to display.">
                        {rows.map((tx) => {
                            const txId = tx._id?.$oid || tx._id;
                            const isPending = tx.sellerStatus === 'pending';

                            return (
                                <Table.Row key={txId}>
                                    {/* Tx ID */}
                                    <Table.Cell className="!pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                                <FiCreditCard className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div
                                                    className="font-mono text-[12px] font-semibold text-slate-800 truncate max-w-[160px]"
                                                    title={tx.transactionId}
                                                >
                                                    {tx.transactionId}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">Ref. ID</div>
                                            </div>
                                        </div>
                                    </Table.Cell>

                                    {/* Product */}
                                    <Table.Cell className="max-w-[240px]">
                                        <div
                                            className="font-semibold text-slate-900 truncate"
                                            title={tx.productTitle}
                                        >
                                            {tx.productTitle}
                                        </div>
                                        {tx.address && (
                                            <div
                                                className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1"
                                                title={tx.address}
                                            >
                                                <FiTruck className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{tx.address}</span>
                                            </div>
                                        )}
                                    </Table.Cell>

                                    {/* Amount */}
                                    <Table.Cell>
                                        <div className="font-bold text-slate-900 text-[15px] whitespace-nowrap">
                                            <span className="text-[10px] uppercase font-semibold text-slate-400 mr-1 align-middle">
                                                {tx.currency}
                                            </span>
                                            {Number(tx.amount || 0).toLocaleString()}
                                        </div>
                                    </Table.Cell>

                                    {/* Payment Status */}
                                    <Table.Cell>
                                        <Chip
                                            color={paymentChipColor(tx.paymentStatus)}
                                            size="sm"
                                            variant="soft"
                                            className="capitalize"
                                        >
                                            {tx.paymentStatus || 'unknown'}
                                        </Chip>
                                    </Table.Cell>

                                    {/* Seller Status */}
                                    <Table.Cell>
                                        <Chip
                                            color={sellerChipColor(tx.sellerStatus)}
                                            size="sm"
                                            variant="soft"
                                            className="capitalize"
                                            startContent={sellerIcon(tx.sellerStatus)}
                                        >
                                            {tx.sellerStatus || 'unknown'}
                                        </Chip>
                                    </Table.Cell>

                                    {/* Actions */}
                                    <Table.Cell className="!pr-6 text-right">
                                        {isPending ? (
                                            <CancelButton transactionId={tx?.transactionId} />
                                        ) : (
                                            <span className="inline-flex items-center text-[11px] text-slate-400 font-medium select-none px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                                                —
                                            </span>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            </div>

            {/* Server-Side URL Driven Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-slate-700">
                        {Math.min(startIndex + rowsPerPage, totalTransactions)}
                    </span>{' '}
                    of <span className="font-semibold text-slate-700">{totalTransactions}</span> results
                </p>

                <div className="flex items-center gap-2">
                    {currentPage > 1 ? (
                        <Link
                            href={`?page=${currentPage - 1}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-slate-700 text-sm font-semibold"
                        >
                            <FiChevronLeft className="text-base" />
                            Prev
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed text-sm font-semibold"
                        >
                            <FiChevronLeft className="text-base" />
                            Prev
                        </button>
                    )}

                    <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
                        {currentPage} <span className="text-slate-400 font-medium">/ {totalPages}</span>
                    </div>

                    {currentPage < totalPages ? (
                        <Link
                            href={`?page=${currentPage + 1}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-slate-700 text-sm font-semibold"
                        >
                            Next
                            <FiChevronRight className="text-base" />
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed text-sm font-semibold"
                        >
                            Next
                            <FiChevronRight className="text-base" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}