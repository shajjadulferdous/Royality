import { UserDetails } from '@/lib/userDetails';
import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { TakeAdreessForm } from '@/components/TakeAddress';
import DeleteFromWishlist from '@/components/DeleteFromWishlist';
import { revalidatePath } from 'next/cache';

const MyWishListPage = async () => {
    const session = await auth.api.getSession(
        {headers:await headers()}
    );
    const user = session?.user;


    if (!user) {
        redirect('/login');
    }

    let wishlist = [];

  
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/${user?.email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            cache: 'no-store' 
        });

        if (!response.ok) {
            return (
                <div className="max-w-5xl mx-auto p-6 mt-10 text-center">
                    <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-8 rounded-2xl">
                        Failed to fetch wishlist. Please try again.
                    </div>
                </div>
            );
        }
        wishlist = await response.json();
    

    // 2. Fetching Product Details using Promise.all
    const productsRaw = await Promise.all(
        wishlist.map(async (item) => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${item.productId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store'
                });
                
                if (!res.ok) return null;
                
                const productData = await res.json();
                
                // Marge both product details and wishlist ID (so you can delete it later)
                return { 
                    ...productData, 
                    wishlistItemId: item._id || item.id 
                };
            } catch (error) {
                return null;
            }
        })
    );

    // Filter out any products that failed to fetch (null values)
    const validProducts = productsRaw.filter(Boolean);

    const nextPath = ()=>{
        revalidatePath('/dashboard/user/my-wishlist');
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">My CardList</h1>
                <p className="text-gray-600 mt-2">
                    Products you have saved for later.
                </p>
            </div>

            {validProducts.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                    <p className="text-lg">Your wishlist is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {validProducts.map((product) => (
                        <div 
                            key={product.wishlistItemId} 
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col"
                        >
                            {/* Product Image Placeholder - Replace src with your actual API's image field */}
                            <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
                                <img
                                    src={product.imageUrl || product.image || 'https://via.placeholder.com/300'}
                                    alt={product.title || 'Product'}
                                    className="object-cover w-full h-full"
                                />
                            </div>

                            <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
                                {product.title || 'Unknown Product'}
                            </h2>
                            <p className="text-lg font-semibold text-[#35858E] mt-1 mb-4">
                                ${product.price || '0.00'}
                            </p>

                            {/* Buttons Container */}
                            <div className="mt-auto flex gap-2 pt-4 border-t border-gray-100">
                                 <DeleteFromWishlist nextPath={nextPath} title={product?.title} productId={product?._id} userEmail={user?.email}></DeleteFromWishlist>
                                 <TakeAdreessForm price={product?.price} productId={product?._id} productTitle={product?.title} sellerEmail={product?.addedByEmail}/>
                                
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyWishListPage;