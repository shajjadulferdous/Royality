import Image from 'next/image';
import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { FiAlertCircle, FiUsers } from 'react-icons/fi';
import RoleSelect from '@/components/RoleSelect';

const ManageUserPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    if (!user) {
        redirect('/login');
    }

    let users = [];
    let fetchError = null;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        if (!res.ok) {
            fetchError = 'Failed to fetch users. Please try again later.';
        } else {
            users = await res.json();
        }
    } catch (error) {
        console.error('Failed to fetch users:', error);
        fetchError = 'Failed to fetch users. Please try again later.';
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#35858E]/10 text-[#35858E] flex items-center justify-center">
                    <FiUsers className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
                    <p className="text-gray-600 mt-1">
                        Promote sellers, deliverymen, or admins from this panel.
                    </p>
                </div>
            </div>

            {fetchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <FiAlertCircle />
                    <span>{fetchError}</span>
                </div>
            )}

            {users.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
                    <p className="text-lg">No users found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.map((u) => (
                        <div
                            key={u._id}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    {u.image ? (
                                        <Image
                                            src={u.image}
                                            alt={u.name || 'User'}
                                            width={56}
                                            height={56}
                                            unoptimized
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-semibold">
                                            {(u.name || u.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-gray-900 truncate">{u.name || 'Unnamed'}</h3>
                                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                        Current role: <span className="font-semibold text-gray-700">{u.role || 'user'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-100">
                                <RoleSelect userId={u._id} currentRole={u.role || 'user'} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageUserPage;