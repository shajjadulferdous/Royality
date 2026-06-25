import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { Card, Chip, Separator } from '@heroui/react';
import { FiMail, FiShield, FiCalendar, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default async function MyProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const user = session?.user;

    if (!user) {
        redirect('/login');
    }

    const joinDate = user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) 
        : 'Unknown Date';

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-6">
            <Card className="w-full shadow-xl bg-white border-none overflow-hidden">
                
                {/* 1. Header Container (Relative for absolute positioning inside) */}
                <div className="relative">
                    {/* Cover Photo / Gradient */}
                    <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-[#35858E] to-teal-400"></div>

                    {/* Pure Tailwind Avatar (No DaisyUI classes to avoid conflicts) */}
                    <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-10">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                            <img 
                                src={user.image || "https://images.unsplash.com/photo-1762119594597-de01cfd19a07"} 
                                alt={user.name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Adjusted Top Padding to compensate for the overlapping avatar */}
                <Card.Content className="pt-16 sm:pt-20 pb-8 px-6 sm:px-10">
                    
                    {/* Header Info: Name, Role, Status */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {user.name}
                                </h1>
                                {/* Status Badge */}
                                <Chip 
                                    color={user.block ? "danger" : "success"} 
                                    size="sm" 
                                    variant="flat"
                                    className="font-semibold"
                                >
                                    {user.block ? "Blocked" : "Active"}
                                </Chip>
                            </div>
                            <p className="text-gray-500 font-medium capitalize mt-1.5 flex items-center gap-2">
                                <FiUser className="text-[#35858E]" /> 
                                {user.role || 'Deliveryman'}
                            </p>
                        </div>
                    </div>

                    <Separator className="my-8 bg-slate-100" />

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Email Info Card */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-sm">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-[#35858E]">
                                <FiMail size={22} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-0.5">Email Address</p>
                                <p className="text-base text-slate-800 font-semibold break-all">{user.email}</p>
                                <div className="mt-2">
                                    {user.emailVerified ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">
                                            <FiCheckCircle size={14} /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-bold">
                                            <FiAlertCircle size={14} /> Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Member Since Card */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-sm">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-[#35858E]">
                                <FiCalendar size={22} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-0.5">Member Since</p>
                                <p className="text-base text-slate-800 font-semibold">{joinDate}</p>
                            </div>
                        </div>

                        {/* Account Role Card */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-sm md:col-span-2">
                            <div className="bg-white p-3 rounded-xl shadow-sm text-[#35858E]">
                                <FiShield size={22} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium mb-0.5">Account Role</p>
                                <p className="text-base text-slate-800 font-semibold capitalize">{user.role}</p>
                            </div>
                        </div>

                    </div>
                </Card.Content>
            </Card>
        </div>
    );
}