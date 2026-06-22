'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { MdProductionQuantityLimits, MdOutlineDescription } from 'react-icons/md';
import { IoPricetagOutline } from 'react-icons/io5';
import { FiBookOpen, FiShield } from 'react-icons/fi';

const AddProductPage = () => {
    const router = useRouter();
    const { 
        data: session, 
        isPending: isSessionPending
    } = authClient.useSession();
    const user = session?.user;
    
    const [isPending, startTransition] = useTransition();
    const [services, setServices] = useState({ warranty: false, guaranty: false });

    const handleCheckboxChange = (e) => {
        setServices({ ...services, [e.target.name]: e.target.checked });
    };

    const uploadImageToImgBB = async (file) => {
        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        if (!apiKey) {
            toast.error('ImgBB API key is missing in environment variables.');
            return null;
        }
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                return data.data.url;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            return null;
        }
    };

    const handleSubmit = async (formData) => {
        if (!user || !user.id) {
            toast.error('Session not loaded yet or user not logged in. Please wait or re-login.');
            return;
        }

        const imageFile = formData.get('image');
        if (!imageFile || imageFile.size === 0) {
            toast.error('Please upload a product image.');
            return;
        }

        startTransition(async () => {
            
            toast.loading('Uploading image...', { id: 'uploading' });
            const imageUrl = await uploadImageToImgBB(imageFile);
            toast.dismiss('uploading');

            if (!imageUrl) {
                toast.error('Failed to upload image to ImgBB.');
                return;
            }

            // 2. Parse form details
            const productDetails = Object.fromEntries(formData.entries());
            
            // Format object matching requested parameters
            productDetails.image = imageUrl;
            productDetails.price = Number(productDetails.price);
            productDetails.quantity = Number(productDetails.quantity);
            productDetails.service = Object.keys(services).filter(key => services[key] === true); // Convert to array of selected services
            productDetails.category = productDetails.category || 'other'; // Default to 'other' if not selected
            // Automatically attached readonly fields from current user session
            productDetails.addedBy = user.id;
            productDetails.addedByName = user.name || 'Anonymous';
            productDetails.addedByEmail = user.email || '';
            productDetails.status = 'pending'; // Default status for new products

            console.log(productDetails);
            
            // 4. API Request
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-product`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(productDetails)
            });

            if (!res.ok) {
                toast.error('Something went wrong adding the product');
                return;
            }

            toast.success('Product added successfully!');
            router.push('/dashboard/seller/my-added-product');
        });
    };

    if (isSessionPending) {
        return (
            <div className='w-full h-96 flex flex-col items-center justify-center gap-4'>
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                <p className='text-sm text-slate-600'>Verifying session, please wait...</p>
            </div>
        );
    }

    return (
        <div className='w-11/12 max-w-7xl mx-auto my-15'>
            <h1 className='font-bold text-4xl text-center'>Add New Product</h1>
            <p className='text-center text-slate-600 mt-3'>Fill in the details below to catalog a new inventory asset on the platform.</p>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-3'>
                <div className='p-3 bg-white flex justify-center items-center gap-2 shadow-sm rounded-lg'>
                    <span className='font-bold w-10 h-10 bg-[#35858E] flex justify-center items-center text-white rounded-full'>1</span>
                    <p className='text-[#35858E] font-bold'>General Info</p>
                </div>
                <div className='p-3 bg-white flex justify-center items-center gap-2 shadow-sm rounded-lg'>
                    <span className='font-bold w-10 h-10 bg-[#35858E] flex justify-center items-center text-white rounded-full'>2</span>
                    <p className='text-[#35858E] font-bold'>Pricing & Stock</p>
                </div>
                <div className='p-3 bg-white flex justify-center items-center gap-2 shadow-sm rounded-lg'>
                    <span className='font-bold w-10 h-10 bg-[#35858E] flex justify-center items-center text-white rounded-full'>3</span>
                    <p className='text-[#35858E] font-bold'>Media Upload</p>
                </div>
                <div className='p-3 bg-white flex justify-center items-center gap-5 shadow-sm rounded-lg'>
                    <span className='font-bold w-10 h-10 bg-[#35858E] flex justify-center items-center text-white rounded-full'>4</span>
                    <p className='text-[#35858E] font-bold'>Service Metrics</p>
                </div>
            </div>

            <form action={handleSubmit} className='grid grid-cols-1 space-y-8 my-20 max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100'>
                
                {/* Read Only Meta Info */}
                {user && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                        <div><span className="font-semibold text-slate-700">Creator Name:</span> {user.name}</div>
                        <div><span className="font-semibold text-slate-700">Creator Email:</span> {user.email}</div>
                    </div>
                )}

                {/* Section 1: Core Details */}
                <div className='w-full space-y-4'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-12 h-12 rounded-full bg-[#35858E] text-white flex items-center justify-center'>
                            <FiBookOpen className='w-6 h-6' />
                        </div>
                        <div>
                            <h2 className='font-bold text-xl'>Product Identification</h2>
                            <p className='text-slate-500 text-sm'>Enter consumer-facing catalog headings</p>
                        </div>
                    </div>
                    
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='flex flex-col gap-1'>
                            <label className="font-semibold text-slate-700">Product Title</label>
                            <input type="text" name='title' className="w-full input border border-slate-200 rounded-xl p-3 outline-none focus:border-[#35858E] transition-colors" placeholder="e.g. Ergonomic Wireless Mouse" required />
                        </div>
                        
                        {/* New Category Field */}
                        <div className='flex flex-col gap-1'>
                            <label className="font-semibold text-slate-700">Category</label>
                            <select 
                                name='category' 
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white outline-none focus:border-[#35858E] transition-colors text-slate-700 cursor-pointer" 
                                defaultValue=""
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                <option value="electronics">Electronics</option>
                                <option value="vehicles">Vehicles & Transport</option>
                                <option value="clothing">Clothing & Apparel</option>
                                <option value="home-appliances">Home Appliances</option>
                                <option value="sports-outdoors">Sports & Outdoors</option>
                                <option value="machinery">Industrial Machinery</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className="font-semibold text-slate-700">Description</label>
                        <textarea name='description' className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-[#35858E] transition-colors min-h-[100px]" placeholder="Provide a high-level breakdown of features..." required />
                    </div>
                </div>

                {/* Section 2: Pricing and Stock */}
                <div className='w-full space-y-4'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-12 h-12 rounded-full bg-[#35858E] text-white flex items-center justify-center'>
                            <IoPricetagOutline className='w-6 h-6' />
                        </div>
                        <div>
                            <h2 className='font-bold text-xl'>Financials & Stock</h2>
                            <p className='text-slate-500 text-sm'>Set asset valuation pricing thresholds</p>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='flex flex-col gap-1'>
                            <label className="font-semibold text-slate-700">Price ($)</label>
                            <input type="number" step="0.01" name='price' required className="w-full input border border-slate-200 rounded-xl p-3 outline-none focus:border-[#35858E] transition-colors" placeholder="e.g. 49.99" />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className="font-semibold text-slate-700">Stock Quantity</label>
                            <input type="number" name='quantity' required className="w-full input border border-slate-200 rounded-xl p-3 outline-none focus:border-[#35858E] transition-colors" placeholder="e.g. 150" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Media Upload */}
                <div className='w-full space-y-4'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-12 h-12 rounded-full bg-[#35858E] text-white flex items-center justify-center'>
                            <MdOutlineDescription className='w-6 h-6' />
                        </div>
                        <div>
                            <h2 className='font-bold text-xl'>Media Capture</h2>
                            <p className='text-slate-500 text-sm'>Upload imagery directly via server interface to ImgBB</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className="font-semibold text-slate-700">Product Image File</label>
                        <input type="file" name='image' accept="image/*" className="w-full border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#35858E]/10 file:text-[#35858E] hover:file:bg-[#35858E]/20" required />
                    </div>
                </div>

                {/* Section 4: Service Framework */}
                <div className='w-full space-y-4'>
                    <div className='flex gap-3 items-center'>
                        <div className='w-12 h-12 rounded-full bg-[#35858E] text-white flex items-center justify-center'>
                            <FiShield className='w-6 h-6' />
                        </div>
                        <div>
                            <h2 className='font-bold text-xl'>Service Agreements & Assurances</h2>
                            <p className='text-slate-500 text-sm'>Specify product warranty configurations</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200'>
                        <label className="font-semibold text-slate-700">Applicable Services</label>
                        <div className='flex gap-6 mt-1'>
                            <label className='flex items-center gap-2 cursor-pointer text-slate-700 font-medium'>
                                <input type="checkbox" name="warranty" checked={services.warranty} onChange={handleCheckboxChange} className="w-4 h-4 rounded border-slate-300 text-[#35858E] focus:ring-[#35858E]" />
                                Warranty
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer text-slate-700 font-medium'>
                                <input type="checkbox" name="guaranty" checked={services.guaranty} onChange={handleCheckboxChange} className="w-4 h-4 rounded border-slate-300 text-[#35858E] focus:ring-[#35858E]" />
                                Guaranty
                            </label>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className="font-semibold text-slate-700">Service Duration</label>
                        <input type="text" name='serviceDuration' className="w-full input border border-slate-200 rounded-xl p-3 outline-none focus:border-[#35858E] transition-colors" placeholder="e.g. 1 Year Replacement" required />
                    </div>
                </div>

                <Button 
                    isDisabled={isPending || isSessionPending} 
                    type='submit' 
                    className="bg-[#35858E] text-white font-semibold h-12 rounded-xl mt-6 w-full shadow-lg shadow-[#35858E]/20 transition-all hover:bg-[#2b6d75]"
                > 
                    {isSessionPending ? 'Verifying Session...' : isPending ? 'Publishing Product Data...' : 'Register Product'}
                </Button>
            </form>
        </div>
    );
};

export default AddProductPage;