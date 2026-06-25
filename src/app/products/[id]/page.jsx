import React from 'react';
import Image from 'next/image';
import { Button } from '@heroui/react';
import { 
    FiShield, 
    FiShoppingCart, 
    FiUser, 
    FiCheckCircle, 
    FiPackage, 
    FiMail
} from 'react-icons/fi';
import BuyCourse from '@/components/BuyCourse';
import { TakeAdreessForm } from '@/components/TakeAddress';

const ProductDetailsPage = async ({ params }) => {
   
    const { id } = await params;   

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
         method: 'GET',
         headers: {
             'Content-Type': 'application/json'
         },
         // cache: 'no-store' // Uncomment if you want fresh data on every load
    });

    if (!response.ok) {
        return (
            <div className="max-w-5xl mx-auto p-6 mt-10">
                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-8 rounded-2xl text-center">
                    <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
                    <p>Failed to fetch product details. Please try again later or check the URL.</p>
                </div>
            </div>
        );
    }

    const data = await response.json();
    // Assuming the API returns the product directly or wrapped in a 'product' key
    const product = data.product || data; 
    
    const isOutOfStock = product.quantity <= 0;

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                    
                    {/* Left Column: Image Showcase */}
                    <div className="w-full lg:w-1/2 p-6 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30">
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 group">
                            <Image 
                                src={product.image} 
                                alt={product.title} 
                                fill
                                unoptimized
                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            {/* Status Badge overlay on image */}
                            <div className="absolute top-4 left-4">
                                <div className="backdrop-blur-md bg-white/80 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm border border-white/50">
                                    <FiCheckCircle className="text-green-600" />
                                    <span className="capitalize text-slate-800">{product.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Product Details */}
                    <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-between">
                        <div>
                            {/* Title & Price Section */}
                            <div className="mb-6">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                                    {product.title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl font-black text-[#35858E]">
                                        ${product.price}
                                    </span>
                                    {/* DaisyUI-style Stock Badge */}
                                    <div className={`badge badge-lg border-none text-white font-medium px-4 py-3 rounded-full flex items-center gap-2 ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}>
                                        <FiPackage />
                                        {isOutOfStock ? 'Out of Stock' : `${product.quantity} In Stock`}
                                    </div>
                                </div>
                            </div>

                            <div className="divider my-6"></div> {/* DaisyUI Divider */}

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">About this product</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {product.description}
                                </p>
                            </div>

                            {/* Service & Warranty Highlight Box */}
                            <div className="bg-[#35858E]/5 border border-[#35858E]/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#35858E]/10 flex items-center justify-center flex-shrink-0 text-[#35858E]">
                                    <FiShield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Service & Assurances</h4>
                                    <p className="text-slate-600 mt-1">
                                        This product comes with a <strong className="text-slate-900 capitalize">{product.guaranty}</strong>. 
                                        Valid for <strong className="text-[#35858E]">{product.serviceDuration} months</strong> from the date of purchase.
                                        Included services: <span className="capitalize">{product.service?.join(', ') || 'None'}</span>.
                                    </p>
                                </div>
                            </div>

                            {/* Seller Information */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Listed By</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                        <FiUser className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{product.addedByName}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                            <FiMail className="w-4 h-4" />
                                            {product.addedByEmail}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Actions */}
                        <div className="pt-6 border-t border-slate-100 flex gap-4 mt-auto">
                           {
                            isOutOfStock ? (
                                <Button disabled className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gray-400 rounded-xl cursor-not-allowed">
                                    <FiShoppingCart />
                                    Add to Cart
                                </Button>
                            ) : (
                               <div className="flex items-center gap-4 px-6 py-3">
                                 <Button variant="solid" className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#35858E] rounded-xl hover:bg-[#35858E]/90 transition-colors duration-200">
                                    <FiShoppingCart />
                                    Add to Cart
                                </Button>
                                
                                 {/* <BuyCourse price={product?.price} productId={product?._id} productTitle={product?.title} /> */}

                                 <TakeAdreessForm price={product?.price} productId={product?._id} productTitle={product?.title}/>

                                <Button variant="outline" className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#35858E] border-[#35858E] rounded-xl hover:bg-[#35858E]/10 transition-colors duration-200">
                                    See AR View
                                </Button>
                                </div>
                            )
                           }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;  
                                  