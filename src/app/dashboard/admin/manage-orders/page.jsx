import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Image from 'next/image';

const AdminProductApprovalPage = async () => {
    const session = await auth.api.getSession({
         headers: await headers()
    });
    
    const user = session?.user;

    // Safety check: You might also want to check if user.role === 'admin' here
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-lg text-gray-600">Please log in as an administrator.</p>
            </div>
        );
    }

    // Example endpoint for admins to fetch all pending products
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pending-products`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        return ( 
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Approvals</h1>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    Failed to fetch pending products. Please try again later.
                </div>   
            </div>  
        );    
    }
    
    const productsData = await response.json();
    const productList = productsData.products || [];

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">Pending Products Review</h1>
                <p className="text-gray-600 mt-2">Review, approve, or reject products submitted by sellers.</p>
            </div>
             
            {productList.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                    <p className="text-lg">No pending products require approval at this time.</p>
                </div>
            ) : (
                // Changed from grid-cols-4 to a single column spacing layout
                <div className="flex flex-col gap-6">
                    {productList.map((product) => {
                        const productId = product._id?.$oid || product._id;
                        
                        return (
                            <div 
                                key={productId} 
                                // Changed card layout to horizontal (sm:flex-row) for wider screens
                                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row overflow-hidden group"
                            >
                                {/* Image Section - Fixed width on desktop, full width on mobile */}
                                <div className="relative w-full sm:w-72 h-56 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
                                    <Image 
                                        src={product.image} 
                                        alt={product.title} 
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 100vw, 300px"
                                    />
                                    {/* Dynamic Status Badge */}
                                    <div className="absolute top-3 left-3 sm:right-3 sm:left-auto">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize shadow-sm
                                            ${product.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                              product.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                              'bg-gray-100 text-gray-800 border border-gray-200'}`
                                        }>
                                            {product.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900" title={product.title}>
                                                {product.title}
                                            </h2>
                                            <p className="text-sm text-gray-500 capitalize mt-1">
                                                Category: <span className="font-medium text-gray-700">{product.category || 'N/A'}</span>
                                            </p>
                                        </div>
                                        <span className="text-2xl font-black text-indigo-600">
                                            ${product.price}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-4 max-w-3xl">
                                        {product.description}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {/* Seller Info */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-600">
                                            <p><span className="font-semibold text-slate-800">Seller:</span> {product.addedByName}</p>
                                            <p className="truncate"><span className="font-semibold text-slate-800">Email:</span> {product.addedByEmail}</p>
                                        </div>

                                        {/* Inventory & Service Info */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-600 space-y-1">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-slate-800">Quantity:</span>
                                                <span className={`${product.quantity === 0 ? 'text-red-500 font-bold' : ''}`}>
                                                    {product.quantity} Units
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-slate-800">Service:</span>
                                                <span className="capitalize">{product.guaranty} ({product.serviceDuration} mo)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons Row - Aligned to the bottom right */}
                                    <div className="flex items-center gap-3 pt-4 mt-auto border-t border-gray-100 justify-end">
                                        {/* Reject Form */}
                                        <form>
                                            <button 
                                                formAction={async () => {
                                                    'use server'
                                                    // await updateProductStatus(productId, 'rejected')
                                                }}
                                                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition-colors duration-200"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                Reject
                                            </button>
                                        </form>

                                        {/* Approve Form */}
                                        <form>
                                            <button 
                                                formAction={async () => {
                                                    'use server'
                                                    // await updateProductStatus(productId, 'approved')
                                                }}
                                                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors duration-200 shadow-sm shadow-green-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                Approve
                                            </button>
                                        </form>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminProductApprovalPage;