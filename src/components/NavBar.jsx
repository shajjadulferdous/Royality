'use client'
import { authClient } from '@/lib/auth-client';
import { Avatar, Button, Dropdown, Spinner } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import NavLink from './NavLink';

const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const { 
        data: session, 
        isPending, 
        error,
        refetch 
    } = authClient.useSession();
    
    const user = session?.user;

    const links = (
      <>
        <li>
          <NavLink href="/">Home</NavLink>
        </li>
        <li>
          <NavLink href="/products">Browse Products</NavLink>
        </li>
        {user && (
          <li>
            <NavLink href={`/dashboard/${user?.role}`}>
              {user?.role === 'admin' ? 'Admin Dashboard' : 'My Orders'}
            </NavLink>
          </li>
        )}
      </>
    );

    return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-[#F8F9FA] backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Text Logo Implementation */}
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold flex items-center select-none">
              <span className="text-xl font-black tracking-widest text-slate-900 uppercase">
                Royalty<span className="text-[#35858E]">.</span>
              </span>
            </Link>
          </div>
        </div>

        <ul className="hidden items-center gap-6 md:flex text-black">
            {links}
        </ul>
        
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            isPending ? (
              <div className="flex justify-center items-center">
                  <Spinner size="xl" className="text-[#35858E]" />
              </div>
            ) : (
              <Dropdown>
                <Button aria-label="User Menu" variant="ghost" size="icon" className="p-0 rounded-full">
                  <Avatar>
                    <Avatar.Image alt={user?.name} src={user?.image} />
                    <Avatar.Fallback>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Avatar.Fallback>
                  </Avatar>
                </Button>
                <Dropdown.Popover>
                  <Dropdown.Menu onAction={(key) => console.log(`Selected: ${key}`)}>
                    <Dropdown.Item id="profile">
                      <Link variant="ghost" href="/my-profile" className="w-full block">My Profile</Link>
                    </Dropdown.Item>
                    <Dropdown.Item id="logout">
                      <button 
                        variant="ghost" 
                        className="w-full text-left text-red-500"
                        onClick={async () => {
                          await authClient.signOut(); 
                          router.push('/');
                        }}
                      >
                        Logout
                      </button>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )
          ) : (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/register">Register</NavLink>
            </>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-separator md:hidden bg-[#F8F9FA]">
          <ul className="flex flex-col gap-2 p-4">
             {links}
            <li className="mt-4 flex flex-col gap-2 border-t border-separator pt-4">
              {!user ? (
                <>
                  <NavLink href="/login" className="block py-2">Login</NavLink>
                  <NavLink href="/register" className="block py-2">Sign Up</NavLink>
                </>
              ) : (
                <>
                  <Link variant="ghost" href="/my-profile" className="block py-2 text-sm text-gray-700">My Profile</Link>
                  <button 
                    className="block py-2 text-sm text-left text-red-500 w-full"
                    onClick={async () => {
                      await authClient.signOut(); 
                      router.push('/');
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav> 
    );
};

export default NavBar;