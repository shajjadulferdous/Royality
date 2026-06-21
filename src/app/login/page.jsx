'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@heroui/react';
import { Icon } from '@iconify-icon/react';

const LoginPage = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, } = useForm();
    
    const handleLogin = async (e) => {
        const { data, error } = await authClient.signIn.email({
            email: e.email, 
            password: e.password,
            rememberMe: true,
            callbackURL: "/",
        });
        
        if (data) {
             console.log(data);
             toast.success(`Welcome back! Signed in successfully.`);
             router.push('/');
        }
        if (error) {
            toast.error(error.message);
        }
    };
    
    const handleError = (errors) => {
        if (errors.email) {
              toast.error("Email is required");
        } else {
               toast.error('Password is required');
        }
    };

    const handleSignInGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
        });
    };

    return (
        <div className='flex justify-between'>
            <div className="w-full bg-white md:shadow-xl md:border md:border-gray-100 flex overflow-hidden min-h-[80vh]">
                
                {/* Branding Sidebar */}
                <div className="hidden md:flex flex-1 bg-[#35858E] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-white text-3xl font-black tracking-wider z-10 select-none uppercase">
                        Royalty.
                    </div>
                    
                    <div className="max-w-md z-10">
                        <Icon icon="fa6-solid:quote-left" className="text-white/20 text-5xl mb-4" />
                        <p className="text-2xl text-white font-medium leading-relaxed tracking-wide">
                            Discover premium quality, timeless elegance, and a lifestyle curated uniquely for you.
                        </p>
                        <div className="h-1 w-12 bg-white/40 mt-6 rounded" />
                    </div>

                    <div className="text-white/60 text-sm z-10">
                        © 2026 Royalty Inc. All rights reserved.
                    </div>
                </div>
                 
                {/* Form Section */}
                <div className='flex-1'>
                    <div className='w-11/12 pt-12 md:p-12 mx-auto'>
                        <h1 className='font-semibold text-xl text-center text-gray-600'>Welcome Back</h1>
                        <p className='text-gray-600 text-sm text-center'>Sign in to manage your orders and view your wishlist.</p>
                        
                        <div>
                            <form onSubmit={handleSubmit(handleLogin, handleError)}>
                                <fieldset className="fieldset rounded-box p-4">
                                    <label className="label text-gray-600 font-semibold text-[16px]">Email</label>
                                    <input type="email" {...register('email', { required: true })} className="input outline-none w-full rounded-full hover:border-[#35858E] hover:border-2" placeholder="Email Address" />

                                    <label className="label text-gray-600 font-semibold text-[16px]">Password</label>
                                    <input type="password" {...register('password', { required: true })}
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" 
                                        title="Must be more than 6 characters, including numbers, lowercase, and uppercase letters"
                                        className="input validator outline-none w-full rounded-full hover:border-[#35858E] hover:border-2" minLength="6" placeholder="Password" />
                                    <p className="validator-hint hidden text-xs text-gray-400 mt-1">
                                        Must be more than 6 characters, including at least one number, one lowercase, and one uppercase letter.
                                    </p>
                                    
                                    <Button type='submit' className="w-full bg-[#35858E] text-white mt-6">Sign In</Button>
                                </fieldset>
                            </form>
                            
                            <p className='flex justify-center text-slate-400 text-sm mt-2'>— OR —</p>

                            <div className='flex justify-center mt-4'>
                                  <Button onClick={handleSignInGoogle} className="w-full" variant="tertiary">
                                     <Icon icon="devicon:google" />
                                      Continue with Google
                                  </Button>
                            </div>
                            
                            <p className='text-center mt-6 text-sm text-gray-600'>
                                New to Royalty? <Link href={'/register'} className='text-[#35858E] font-medium hover:underline'>Create an Account</Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;