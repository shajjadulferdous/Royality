import { Button } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const page = async () => {
    const  respons = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!respons.ok) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    Failed to fetch products. Please try again later.
                </div>
            </div>
        );
    }
    const pendingProducts = await respons.json();
    return (
        <div>
            <div className="max-w-5xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
                {pendingProducts.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                        <p className="text-lg">No products available at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {pendingProducts.map((product) => (
                            <div key={product._id} className="bg-white shadow-md rounded-lg p-4">
                                <div>
                                    <Image src={product.image} alt={product.title || ""} width={200} height={200} className="w-full h-48 object-cover rounded-lg" />
                                </div>
                                 <div className="space-y-2 mt-4">
                                    <h2 className="text-lg font-semibold text-gray-800">{product.title || product.name}</h2>
                                    <p className="text-gray-600 mt-1">${product.price}</p>
                                    <Link href={`/products/${product._id}`} className=" cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                        Details
                                    </Link>
                                </div>  
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


export default page;    
