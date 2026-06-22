import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

const MyProductPage = async () => {
    const session = await auth.api.getSession({
         headers: await headers()
    });
    
    const user = session?.user;

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-lg text-gray-600">Please log in to view your products.</p>
            </div>
        );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-products?email=${user.email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        return ( 
            <div className="max-w-7xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">My Added Products</h1>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    Failed to fetch products. Please try again later.
                </div>   
            </div>  
        );    
    }
    
    const productsData = await response.json();
    const productList = productsData.products || [];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Added Products</h1>
                <p className="text-gray-600 mt-2">Manage all the products you have listed on the platform.</p>
            </div>
             
            {productList.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                    <p className="text-lg">You have not added any products yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {productList.map((product) => {
                        const productId = product._id?.$oid || product._id;
                        
                        return (
                            <div 
                                key={productId} 
                                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                            >
                                {/* Image Section */}
                                <div className="relative w-full h-52 bg-gray-100 overflow-hidden">
                                    <Image 
                                        src={product.image} 
                                        alt={product.title} 
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                    {/* Dynamic Status Badge */}
                                    <div className="absolute top-3 right-3">
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
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <h2 className="text-lg font-bold text-gray-900 line-clamp-1" title={product.title}>
                                            {product.title}
                                        </h2>
                                        <span className="text-lg font-black text-indigo-600">
                                            ${product.price}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                                        {product.description}
                                    </p>

                                    {/* Meta Data */}
                                    <div className="space-y-2 text-sm text-gray-500 border-t border-gray-100 pt-4 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span>Quantity</span>
                                            <span className={`font-medium ${product.quantity === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                                {product.quantity === 0 ? 'Out of Stock' : product.quantity}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Guaranty</span>
                                            <span className="font-medium text-gray-900 capitalize">
                                                {product.guaranty} ({product.serviceDuration} mo)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                        {/* Edit Link/Button */}
                                        <Link 
                                            href={`/my-products/edit/${productId}`}
                                            className="flex items-center justify-center gap-2 flex-1 px-3 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                            Edit
                                        </Link>

                                        {/* Delete Form (Using Server Actions or API Route) */}
                                        <form className="flex-1">
                                            <button 
                                                formAction={async () => {
                                                    'use server'
                                                    // Add your deletion server action logic here!
                                                    // e.g., await deleteProduct(productId)
                                                }}
                                                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors duration-200 shadow-sm shadow-red-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                Delete
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

export default MyProductPage;