'use client';

const NAV_CONFIG = {
  seller: [
    { href: "/dashboard/seller", label: "Dashboard", icon: LuLayoutDashboard },
    { href: "/dashboard/seller/add-product", label: "Add a Product", icon: FaPlusCircle },
    { href: "/dashboard/seller/my-added-product", label: "My Added Products", icon: LuPackage },
    { href: "/dashboard/seller/requested-bookings", label: "Requested Bookings", icon: LuCalendarClock },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Admin Dashboard", icon: LuShieldAlert },
    { href: "/dashboard/admin/manage-orders", label: "Manage Product", icon: LuShoppingBag },
    { href: "/dashboard/admin/manage-users", label: "Manage Users", icon: LuUsers },
  ],
  user: [
    { href: "/dashboard/user", label: "User Dashboard", icon: LuLayoutDashboard },
    { href: "/dashboard/user/my-orders", label: "My Orders", icon: LuShoppingBag },
    { href: "/dashboard/user/my-wishlist", label: "My Wishlist", icon: LuHeart },
    { href: "/dashboard/user/transactions", label: "Transactions", icon: LuCreditCard },
  ],
  deliveryman: [
    { href: "/dashboard/deliveryman", label: "Dashboard", icon: LuLayoutDashboard },
    { href: "/dashboard/deliveryman/deliveries", label: "Deliveries", icon: LuTruck },
  ],
};

import NavLink from '@/components/NavLink';
import { SideBar } from '@/components/SideBar';
import React from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import {
  LuCalendarClock,
  LuCreditCard,
  LuHeart,
  LuLayoutDashboard,
  LuPackage,
  LuShieldAlert,
  LuShoppingBag,
  LuTruck,
  LuUsers,
} from 'react-icons/lu';

const DeliverymanDashboardLayout = ({ children }) => {
    const navItems = NAV_CONFIG['deliveryman'] || [];

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className="w-64 p-4 border-r border-gray-200">
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <NavLink key={item.href} href={item.href} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700">
                            <item.icon className="size-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <div className='hidden'>
              <SideBar/>
            </div>

            <main className="flex-1 h-full overflow-y-auto p-6 bg-gray-100">
                {children}
            </main>
        </div>
    );
};

export default DeliverymanDashboardLayout;
