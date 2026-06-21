import { Button } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NavLink = ({href , children }) => {
    const pathname = usePathname();
    const isActive = pathname == href;
    return (
        <Link href={href}
        >
         <Button variant='ghost' className={`${isActive? 'bg-[#35858E] text-white':''}`}>{children}</Button>
        </Link>
    );
};

export default NavLink;